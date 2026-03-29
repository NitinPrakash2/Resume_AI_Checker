import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login, forgotPassword, verifyOtp, resetPassword } from '../services/resumeService'
import { useTheme } from '../context/ThemeContext'

// ── Forgot-password modal (3 steps) ──────────────────────────────────────────
function ForgotModal({ onClose }) {
  const [step, setStep]           = useState(1) // 1=email, 2=otp, 3=new-password
  const [email, setEmail]         = useState('')
  const [otp, setOtp]             = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPass, setNewPass]     = useState('')
  const [confirmPass, setConfirm] = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [notRegistered, setNotRegistered] = useState(false)
  const [success, setSuccess]       = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  const startCooldown = () => {
    setResendCooldown(60)
    const t = setInterval(() => {
      setResendCooldown(s => { if (s <= 1) { clearInterval(t); return 0 } return s - 1 })
    }, 1000)
  }

  const handleSendOtp = async (e) => {
    e?.preventDefault()
    setError(''); setNotRegistered(false)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address (e.g. name@mail.com)')
      return
    }
    setLoading(true)
    try {
      await forgotPassword(email)
      setStep(2)
      startCooldown()
    } catch (err) {
      if (err.response?.data?.notRegistered) {
        setNotRegistered(true)
      } else {
        setError(err.response?.data?.error || 'Failed to send OTP')
      }
    } finally { setLoading(false) }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const data = await verifyOtp(email, otp)
      setResetToken(data.resetToken)
      setStep(3)
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP')
    } finally { setLoading(false) }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await resetPassword(resetToken, newPass, confirmPass)
      setSuccess('Password reset! You can now sign in.')
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed')
    } finally { setLoading(false) }
  }

  const stepLabel = ['Enter Email', 'Verify OTP', 'New Password']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white dark:bg-[#0f1829] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl dark:shadow-none animate-scale-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white font-headline">Reset Password</h2>
            <p className="text-xs text-gray-400 dark:text-[#8892a4] mt-0.5">Step {step} of 3 — {stepLabel[step - 1]}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-[#8892a4] hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex gap-1.5 px-6 pt-4">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                s <= step ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10'
              }`}
            />
          ))}
        </div>

        <div className="px-6 py-6">
          {/* Error / Success */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-400/10 border border-red-200 dark:border-red-400/20 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-start gap-2">
              <span className="material-symbols-outlined text-base mt-0.5 flex-shrink-0">error</span>
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-400/10 border border-green-200 dark:border-green-400/20 rounded-xl text-green-600 dark:text-green-400 text-sm flex items-start gap-2">
              <span className="material-symbols-outlined text-base mt-0.5 flex-shrink-0">check_circle</span>
              {success}
            </div>
          )}

          {/* ── Step 1: Email ── */}
          {step === 1 && !success && (
            notRegistered ? (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="material-symbols-outlined text-red-500 dark:text-red-400 text-lg">person_off</span>
                    <p className="text-sm font-bold text-red-700 dark:text-red-300">Account not found</p>
                  </div>
                  <p className="text-xs text-red-600 dark:text-red-400 pl-7">
                    <span className="font-semibold">{email}</span> is not registered.
                  </p>
                </div>
                <p className="text-xs text-gray-500 dark:text-[#8892a4] text-center">
                  No account with this email. Please create one first.
                </p>
                <Link
                  to="/register"
                  onClick={onClose}
                  className="w-full py-3 bg-gradient-to-r from-primary to-primary-container text-[#0b1120] font-bold rounded-xl hover:opacity-90 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">person_add</span>
                  Create Account
                </Link>
                <button
                  type="button"
                  onClick={() => { setNotRegistered(false); setEmail('') }}
                  className="w-full py-2.5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-[#8892a4] text-sm font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                >
                  Try a different email
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-[#8892a4]">
                  Enter your registered email and we'll send a 6-digit OTP.
                </p>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#8892a4] mb-2 block">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#3d4a5c] outline-none focus:border-blue-400 dark:focus:border-primary/50 transition-all text-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-primary to-primary-container text-[#0b1120] font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 text-sm"
                >
                  {loading ? 'Sending OTP…' : 'Send OTP'}
                </button>
              </form>
            )
          )}

          {/* ── Step 2: OTP ── */}
          {step === 2 && !success && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-[#8892a4]">
                We sent a 6-digit code to <span className="text-gray-900 dark:text-white font-semibold">{email}</span>. Check your inbox.
              </p>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#8892a4] mb-2 block">OTP Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  required
                  maxLength={6}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#3d4a5c] outline-none focus:border-blue-400 dark:focus:border-primary/50 transition-all text-sm tracking-[0.3em] font-mono text-center"
                />
              </div>
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3 bg-gradient-to-r from-primary to-primary-container text-[#0b1120] font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 text-sm"
              >
                {loading ? 'Verifying…' : 'Verify OTP'}
              </button>
              <div className="text-center">
                {resendCooldown > 0 ? (
                  <span className="text-xs text-gray-400 dark:text-[#8892a4]">Resend in {resendCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="text-xs text-primary hover:underline"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </form>
          )}

          {/* ── Step 3: New Password ── */}
          {step === 3 && !success && (
            <form onSubmit={handleReset} className="space-y-4">
              <p className="text-sm text-gray-500 dark:text-[#8892a4]">Choose a strong new password (min. 6 characters).</p>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#8892a4] mb-2 block">New Password</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#3d4a5c] outline-none focus:border-blue-400 dark:focus:border-primary/50 transition-all text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#8892a4] mb-2 block">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#3d4a5c] outline-none focus:border-blue-400 dark:focus:border-primary/50 transition-all text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary to-primary-container text-[#0b1120] font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 text-sm"
              >
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>
            </form>
          )}

          {/* ── Success state ── */}
          {success && (
            <button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-primary to-primary-container text-[#0b1120] font-bold rounded-xl hover:opacity-90 transition-all text-sm"
            >
              Back to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Login page ────────────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [showForgot, setShowForgot] = useState(false)
  const { theme, toggleTheme }    = useTheme()
  const dark = theme === 'dark'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#070d1a] flex items-center justify-center px-6 py-12 transition-colors duration-300">

      {/* Top bar */}
      <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-gray-500 dark:text-[#8892a4] hover:text-blue-600 dark:hover:text-primary transition-colors group">
          <span className="material-symbols-outlined text-base group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
          <span className="text-sm font-semibold">Back to Home</span>
        </Link>
        <button
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-[#A6ADFF] hover:bg-gray-200 dark:hover:bg-white/[0.10] shadow-sm hover:shadow-md transition-all"
          title="Toggle theme"
        >
          <span className="material-symbols-outlined text-[20px]">{dark ? 'light_mode' : 'dark_mode'}</span>
        </button>
      </div>

      {/* Background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 dark:bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 dark:bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-container rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-[#0b1120]">description</span>
            </div>
            <span className="text-2xl font-bold font-headline text-gray-900 dark:text-white">ResumeAI</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-headline mb-2">Welcome Back</h1>
          <p className="text-gray-500 dark:text-[#8892a4]">Sign in to continue to your dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-[#0f1829] border border-gray-200 dark:border-white/10 rounded-2xl p-8 shadow-xl dark:shadow-none">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-400/10 border border-red-200 dark:border-red-400/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#8892a4] mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#3d4a5c] outline-none focus:border-blue-400 dark:focus:border-primary/50 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#8892a4] mb-2 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#3d4a5c] outline-none focus:border-blue-400 dark:focus:border-primary/50 transition-all"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-500 dark:text-[#8892a4] cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 dark:border-white/10" />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => setShowForgot(true)}
                className="text-blue-600 dark:text-primary hover:underline font-medium"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary to-primary-container text-[#0b1120] font-bold rounded-xl hover:opacity-90 hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-[#8892a4]">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-blue-600 dark:text-primary hover:underline font-semibold">
              Sign up
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot password modal */}
      {showForgot && <ForgotModal onClose={() => setShowForgot(false)} />}
    </div>
  )
}
