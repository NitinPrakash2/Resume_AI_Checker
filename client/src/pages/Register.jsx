import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../services/resumeService'
import { useTheme } from '../context/ThemeContext'

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { theme, toggleTheme } = useTheme()
  const dark = theme === 'dark'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await register(name, email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
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
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 dark:bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[120px]" />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-container rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-[#0b1120]">description</span>
            </div>
            <span className="text-2xl font-bold font-headline text-gray-900 dark:text-white">Resumate</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-headline mb-2">Create Account</h1>
          <p className="text-gray-500 dark:text-[#8892a4]">Start optimizing your resume with AI</p>
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
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#8892a4] mb-2 block">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#3d4a5c] outline-none focus:border-blue-400 dark:focus:border-primary/50 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-[#8892a4] mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-[#3d4a5c] outline-none focus:border-blue-400 dark:focus:border-primary/50 transition-all"
              />
              <p className="text-xs text-gray-400 dark:text-[#8892a4] mt-1">Must be at least 6 characters</p>
            </div>

            <div className="flex items-start gap-2 text-sm">
              <input type="checkbox" required className="w-4 h-4 mt-0.5 rounded border-gray-300 dark:border-white/10" />
              <label className="text-gray-500 dark:text-[#8892a4]">
                I agree to the{' '}
                <a href="#" className="text-blue-600 dark:text-primary hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-blue-600 dark:text-primary hover:underline">Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-primary to-primary-container text-[#0b1120] font-bold rounded-xl hover:opacity-90 hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-[#8892a4]">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-primary hover:underline font-semibold">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
