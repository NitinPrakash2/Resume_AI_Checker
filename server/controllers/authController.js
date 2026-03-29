const jwt  = require('jsonwebtoken')
const User = require('../models/User')

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
      attributes: ['id', 'name', 'email', 'aiProvider', 'aiModel', 'aiApiKey', 'latestResumeId', 'createdAt'],
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
    if (name)                  updates.name       = name
    if (aiProvider)            updates.aiProvider = aiProvider
    if (aiModel !== undefined) updates.aiModel    = aiModel
    if (aiApiKey !== undefined) updates.aiApiKey  = aiApiKey || null

    await user.update(updates)
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, aiProvider: user.aiProvider, aiModel: user.aiModel, aiApiKey: user.aiApiKey } })
  } catch (err) { next(err) }
}

const changePassword = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const { currentPassword, newPassword, confirmPassword } = req.body
    if (!currentPassword || !newPassword || !confirmPassword)
      return res.status(400).json({ error: 'All fields are required' })
    if (newPassword.length < 6)
      return res.status(400).json({ error: 'New password must be at least 6 characters' })
    if (newPassword !== confirmPassword)
      return res.status(400).json({ error: 'Passwords do not match' })

    const valid = await user.comparePassword(currentPassword)
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' })

    user.password = newPassword
    await user.save()
    res.json({ success: true, message: 'Password changed successfully' })
  } catch (err) { next(err) }
}

const testApiKey = async (req, res) => {
  const { provider, apiKey, model } = req.body
  if (!provider || !apiKey)
    return res.status(400).json({ error: 'Provider and apiKey are required' })

  try {
    const ai = require('../services/aiService')
    await ai.getAIAnswer('Test', '', { provider, apiKey, model: model || '' })
    if (!res.headersSent) res.json({ success: true, message: `${provider} key is valid!` })
  } catch (err) {
    if (res.headersSent) return
    const status = err.response?.status
    let error = 'Key test failed'
    if (status === 401 || status === 403)                          error = 'Invalid API key — check and try again'
    else if (status === 429 || err.message?.includes('quota'))    error = 'Key is valid but quota/rate limit exceeded'
    else if (status === 404)                                       error = 'Model not found — try a different model'
    else if (err.message)                                          error = err.message
    res.status(400).json({ error })
  }
}

module.exports = { register, login, getMe, getLatestResume, setLatestResume, updateSettings, testApiKey, changePassword }
