const jwt        = require('jsonwebtoken')
const crypto     = require('crypto')
const nodemailer = require('nodemailer')
const User       = require('../models/User')
const ai         = require('../services/aiService')

function makeOtp() {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function getTransporter() {
  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
    port:   Number(process.env.EMAIL_PORT) || 465,
    secure: true,           // TLS from the start (port 465); never falls back to plaintext
    auth:   { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    tls:    { rejectUnauthorized: true, minVersion: 'TLSv1.2' },
  })
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  )
}

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required' })
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    const exists = await User.findOne({ where: { email } })
    if (exists) return res.status(409).json({ error: 'Email already registered' })
    const user  = await User.create({ name, email, password })
    const token = signToken(user)
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } })
  } catch (err) { next(err) }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' })
    const user = await User.findOne({ where: { email } })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })
    const valid = await user.comparePassword(password)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
    const token = signToken(user)
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } })
  } catch (err) { next(err) }
}

const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'aiProvider', 'aiModel', 'aiApiKey', 'savedApiKeys', 'latestResumeId', 'createdAt'],
    })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user.toJSON())
  } catch (err) { next(err) }
}

const getLatestResume = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['latestResumeId'] })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ latestResumeId: user.latestResumeId || null })
  } catch (err) { next(err) }
}

const setLatestResume = async (req, res, next) => {
  try {
    const { latestResumeId } = req.body
    await User.update({ latestResumeId: latestResumeId || null }, { where: { id: req.user.id } })
    res.json({ success: true, latestResumeId: latestResumeId || null })
  } catch (err) { next(err) }
}

const updateSettings = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    const { name, aiProvider, aiApiKey, aiModel } = req.body
    const updates = {}
    if (name)                   updates.name       = name
    if (aiProvider)             updates.aiProvider = aiProvider
    if (aiModel !== undefined)  updates.aiModel    = aiModel
    if (aiApiKey !== undefined) updates.aiApiKey   = aiApiKey || null
    await user.update(updates)
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, aiProvider: user.aiProvider, aiModel: user.aiModel, aiApiKey: user.aiApiKey } })
  } catch (err) { next(err) }
}

const getSavedKeys = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['savedApiKeys'] })
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user.savedApiKeys || [])
  } catch (err) { next(err) }
}

const saveApiKey = async (req, res, next) => {
  try {
    const { label, provider, apiKey, model } = req.body
    if (!provider || !apiKey) return res.status(400).json({ error: 'Provider and apiKey are required' })
    const user = await User.findByPk(req.user.id, { attributes: ['id', 'savedApiKeys'] })
    if (!user) return res.status(404).json({ error: 'User not found' })
    const existing = user.savedApiKeys || []
    const isDuplicate = existing.some(k => {
      if (k.provider !== provider) return false
      const a = Buffer.from(k.apiKey.padEnd(512))
      const b = Buffer.from(apiKey.padEnd(512))
      return a.length === b.length && crypto.timingSafeEqual(a, b)
    })
    if (isDuplicate)
      return res.status(409).json({ error: 'This key is already saved' })
    const newKey = { id: crypto.randomUUID(), label: label || provider, provider, apiKey, model: model || '', addedAt: new Date().toISOString() }
    await user.update({ savedApiKeys: [...existing, newKey] })
    res.json(newKey)
  } catch (err) { next(err) }
}

const deleteSavedKey = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, { attributes: ['id', 'savedApiKeys'] })
    if (!user) return res.status(404).json({ error: 'User not found' })
    await user.update({ savedApiKeys: (user.savedApiKeys || []).filter(k => k.id !== req.params.keyId) })
    res.json({ success: true })
  } catch (err) { next(err) }
}

const PWD_MAX_ATTEMPTS = 5
const PWD_LOCKOUT_MS   = 15 * 60 * 1000 // 15 minutes

const changePassword = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    // Server-side gate: reject if account is locked (CWE-807)
    if (user.pwdLockedUntil && Date.now() < Number(user.pwdLockedUntil))
      return res.status(429).json({ error: 'Too many failed attempts. Try again in 15 minutes.' })

    const { currentPassword, newPassword, confirmPassword } = req.body
    if (!currentPassword || !newPassword || !confirmPassword)
      return res.status(400).json({ error: 'All fields are required' })
    if (newPassword.length < 6)
      return res.status(400).json({ error: 'New password must be at least 6 characters' })
    if (newPassword !== confirmPassword)
      return res.status(400).json({ error: 'Passwords do not match' })

    const valid = await user.comparePassword(currentPassword)
    if (!valid) {
      const attempts = (user.pwdFailedAttempts || 0) + 1
      const locked   = attempts >= PWD_MAX_ATTEMPTS
      await user.update({
        pwdFailedAttempts: locked ? 0 : attempts,
        pwdLockedUntil:    locked ? Date.now() + PWD_LOCKOUT_MS : null,
      })
      return res.status(401).json({ error: locked
        ? 'Too many failed attempts. Account locked for 15 minutes.'
        : 'Current password is incorrect'
      })
    }

    user.password = newPassword
    await user.update({ password: newPassword, pwdFailedAttempts: 0, pwdLockedUntil: null })
    res.json({ success: true, message: 'Password changed successfully' })
  } catch (err) { next(err) }
}

const testApiKey = async (req, res) => {
  const { provider, apiKey, model } = req.body
  if (!provider || !apiKey)
    return res.status(400).json({ error: 'Provider and apiKey are required' })
  try {
    await ai.getAIAnswer('Test', '', { provider, apiKey, model: model || '' })
    if (!res.headersSent) res.json({ success: true, message: `${provider} key is valid!` })
  } catch (err) {
    if (res.headersSent) return
    const status = err.response?.status
    let error = 'Key test failed'
    if (status === 401 || status === 403)                       error = 'Invalid API key — check and try again'
    else if (status === 429 || err.message?.includes('quota')) error = 'Key is valid but quota/rate limit exceeded'
    else if (status === 404)                                    error = 'Model not found — try a different model'
    else if (err.message)                                       error = err.message
    res.status(400).json({ error })
  }
}

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email is required' })
    const user = await User.findOne({ where: { email } })
    if (!user) return res.status(404).json({ error: 'No account found with this email.', notRegistered: true })
    const otp    = makeOtp()
    const expiry = Date.now() + 10 * 60 * 1000
    await user.update({ resetOtp: otp, resetOtpExpiry: expiry })
    const transporter = getTransporter()
    await transporter.sendMail({
      from: `"Resumate" <${process.env.EMAIL_USER}>`,
      to:   email,
      subject: 'Your Resumate Password Reset OTP',
      html: `
        <div style="font-family:Inter,sans-serif;max-width:480px;margin:auto;padding:32px;background:#0f1829;border-radius:16px;color:#dae2fd">
          <h2 style="margin:0 0 8px;font-size:22px">Reset your password</h2>
          <p style="color:#8892a4;margin:0 0 24px">Use the OTP below. It expires in <strong style="color:#c0c1ff">10 minutes</strong>.</p>
          <div style="background:#1a2540;border:1px solid rgba(192,193,255,0.15);border-radius:12px;padding:24px;text-align:center;letter-spacing:12px;font-size:36px;font-weight:800;color:#c0c1ff">${otp}</div>
          <p style="color:#8892a4;font-size:12px;margin-top:24px">If you didn't request this, ignore this email.</p>
        </div>`,
    })
    res.json({ message: 'OTP sent to your email.' })
  } catch (err) { next(err) }
}

const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' })

    // Validate OTP is exactly a 6-digit string before any DB lookup
    const otpStr = String(otp).trim()
    if (!/^\d{6}$/.test(otpStr))
      return res.status(400).json({ error: 'Invalid OTP format' })

    const user = await User.findOne({ where: { email } })

    // Check expiry first — avoids leaking whether OTP matches on expired tokens
    if (!user || !user.resetOtp || !user.resetOtpExpiry)
      return res.status(400).json({ error: 'Invalid OTP' })
    if (Date.now() > Number(user.resetOtpExpiry)) {
      await user.update({ resetOtp: null, resetOtpExpiry: null })
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' })
    }

    // Timing-safe comparison to prevent timing attacks (CWE-807)
    const expected = Buffer.from(user.resetOtp.padEnd(64))
    const received = Buffer.from(otpStr.padEnd(64))
    const match = expected.length === received.length &&
      crypto.timingSafeEqual(expected, received)

    if (!match) {
      return res.status(400).json({ error: 'Invalid OTP' })
    }

    const resetToken = jwt.sign(
      { id: user.id, purpose: 'reset' },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    )
    // Clear OTP — single use
    await user.update({ resetOtp: null, resetOtpExpiry: null })
    res.json({ resetToken })
  } catch (err) { next(err) }
}

const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body
    if (!resetToken || !newPassword || !confirmPassword)
      return res.status(400).json({ error: 'All fields are required' })
    if (newPassword !== confirmPassword)
      return res.status(400).json({ error: 'Passwords do not match' })
    if (newPassword.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    let payload
    try {
      payload = jwt.verify(resetToken, process.env.JWT_SECRET)
    } catch {
      return res.status(400).json({ error: 'Reset session expired. Please start over.' })
    }
    if (payload.purpose !== 'reset')
      return res.status(400).json({ error: 'Invalid reset token' })
    const user = await User.findByPk(payload.id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    // Server-side gate: reject if reset was not granted via verifyOtp (CWE-807)
    user.password = newPassword
    await user.save()
    res.json({ message: 'Password reset successfully. You can now sign in.' })
  } catch (err) { next(err) }
}

module.exports = {
  register, login, getMe, getLatestResume, setLatestResume,
  updateSettings, testApiKey, changePassword, forgotPassword,
  verifyOtp, resetPassword, getSavedKeys, saveApiKey, deleteSavedKey
}
