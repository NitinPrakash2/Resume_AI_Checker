import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getMe, updateSettings, testApiKey, changePassword, forgotPassword, verifyOtp, resetPassword } from '../services/resumeService'

const PROVIDERS = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/20',
    icon: '🔀',
    placeholder: 'sk-or-v1-...',
    getKeyUrl: 'https://openrouter.ai/keys',
    badge: 'Free tier',
    badgeColor: 'text-green-400 bg-green-400/10 border-green-400/20',
    description: 'Access 100+ models. Free tier available.',
    models: [
      { id: 'openrouter/free', label: 'Auto Free (Recommended)' },
      { id: 'meta-llama/llama-3.3-70b-instruct:free', label: 'Llama 3.3 70B (Free)' },
      { id: 'mistralai/mistral-small-3.1-24b-instruct:free', label: 'Mistral Small 24B (Free)' },
      { id: 'openai/gpt-4o', label: 'GPT-4o (Paid)' },
      { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet (Paid)' },
    ],
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
    icon: '✨',
    placeholder: 'AIzaSy...',
    getKeyUrl: 'https://aistudio.google.com/app/apikey',
    badge: 'Free tier',
    badgeColor: 'text-green-400 bg-green-400/10 border-green-400/20',
    description: 'Google Gemini models with generous free limits.',
    models: [
      { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Free)' },
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
      { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    ],
  },
  {
    id: 'groq',
    name: 'Groq',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20',
    icon: '⚡',
    placeholder: 'gsk_...',
    getKeyUrl: 'https://console.groq.com/keys',
    badge: 'Ultra fast',
    badgeColor: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    description: 'Ultra-fast inference with Llama & Mixtral.',
    models: [
      { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B Instant' },
      { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B' },
      { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' },
    ],
  },
  {
    id: 'grok',
    name: 'xAI Grok',
    color: 'text-white',
    bg: 'bg-white/10',
    border: 'border-white/20',
    icon: '𝕏',
    placeholder: 'xai-...',
    getKeyUrl: 'https://console.x.ai',
    badge: 'Real-time',
    badgeColor: 'text-white bg-white/10 border-white/20',
    description: "xAI's Grok with real-time knowledge.",
    models: [
      { id: 'grok-beta', label: 'Grok Beta' },
      { id: 'grok-2', label: 'Grok 2' },
    ],
  },
]

const LS_KEYS     = 'resumeai_api_keys'
const LS_PROVIDER = 'resumeai_provider'
const LS_MODEL    = 'resumeai_model'

function loadLocalKeys() {
  try { return JSON.parse(localStorage.getItem(LS_KEYS) || '{}') } catch { return {} }
}

export default function Settings() {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [savingKey, setSavingKey] = useState(false)
  const [savedKey, setSavedKey]   = useState(false)
  const [name, setName]       = useState('')

  const [activeProvider, setActiveProvider] = useState('openrouter')
  const [activeModel, setActiveModel]       = useState('')
  const [apiKey, setApiKey]                 = useState('')
  const [showKey, setShowKey]               = useState(false)
  const [testing, setTesting]               = useState(false)
  const [testResult, setTestResult]         = useState(null)
  const [savedKeys, setSavedKeys]           = useState({})
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordChanged, setPasswordChanged] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Forgot / reset password (OTP flow)
  const [fpOpen, setFpOpen]           = useState(false)
  const [fpStep, setFpStep]           = useState(1)
  const [fpEmail, setFpEmail]         = useState('')
  const [fpOtp, setFpOtp]             = useState('')
  const [fpResetToken, setFpResetToken] = useState('')
  const [fpNewPass, setFpNewPass]     = useState('')
  const [fpConfirm, setFpConfirm]     = useState('')
  const [fpLoading, setFpLoading]     = useState(false)
  const [fpError, setFpError]         = useState('')
  const [fpSuccess, setFpSuccess]     = useState('')
  const [fpNotReg, setFpNotReg]       = useState(false)
  const [fpCooldown, setFpCooldown]   = useState(0)

  // Section Refs
  const profileRef = useRef(null)
  const aiRef = useRef(null)
  const securityRef = useRef(null)
  const billingRef = useRef(null)

  const isLoggedIn = !!(sessionStorage.getItem('token'))

  useEffect(() => {
    if (!isLoggedIn) { 
      const local    = loadLocalKeys()
      const provider = localStorage.getItem(LS_PROVIDER) || 'openrouter'
      const model    = localStorage.getItem(LS_MODEL)    || ''

      setActiveProvider(provider)
      setActiveModel(model)
      setApiKey(local[provider] || '')

      const saved = {}
      PROVIDERS.forEach(p => { saved[p.id] = !!local[p.id] })
      setSavedKeys(saved)
      setLoading(false)
      return
    }

    getMe()
      .then(u => {
        setUser(u)
        setName(u.name || '')
        
        const provider = u.aiProvider || 'openrouter'
        const model = u.aiModel || ''
        const key = u.aiApiKey || ''
        
        setActiveProvider(provider)
        setActiveModel(model)
        
        if (key) {
          setApiKey(key)
        } else {
          const local = loadLocalKeys()
          setApiKey(local[provider] || '')
        }
        
        const saved = {}
        PROVIDERS.forEach(p => { saved[p.id] = (p.id === provider && (key || loadLocalKeys()[p.id])) })
        setSavedKeys(saved)
      })
      .catch(err => {
        console.error('Failed to load user:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleProviderChange = (id) => {
    setActiveProvider(id)
    setActiveModel('')
    setTestResult(null)
    setShowKey(false)
    
    if (isLoggedIn) {
      if (user?.aiProvider === id && user?.aiApiKey) {
        setApiKey(user.aiApiKey)
      } else {
        const local = loadLocalKeys()
        setApiKey(local[id] || '')
      }
    } else {
      const local = loadLocalKeys()
      setApiKey(local[id] || '')
    }
  }

  const handleTest = async () => {
    if (!apiKey) return
    setTesting(true)
    setTestResult(null)
    try {
      const res = await testApiKey(activeProvider, apiKey, activeModel)
      setTestResult({ ok: true, msg: res.message || 'Key is valid!' })
    } catch (err) {
      console.error('Test error:', err)
      setTestResult({ ok: false, msg: err.response?.data?.error || err.message || 'Invalid key' })
    } finally {
      setTesting(false)
    }
  }

  const handleSaveApiKey = async () => {
    if (!apiKey) {
      alert('Please enter an API key')
      return
    }

    setSavingKey(true)
    try {
      if (isLoggedIn) {
        // Save everything to DB — no localStorage needed
        await updateSettings({ 
          name, 
          aiProvider: activeProvider, 
          aiModel: activeModel, 
          aiApiKey: apiKey 
        })
        setUser(prev => ({
          ...prev,
          aiProvider: activeProvider,
          aiModel: activeModel,
          aiApiKey: apiKey
        }))
      } else {
        // Guest fallback — localStorage only
        localStorage.setItem('resumeai_provider', activeProvider)
        localStorage.setItem('resumeai_model', activeModel)
        const local = loadLocalKeys()
        local[activeProvider] = apiKey
        localStorage.setItem('resumeai_api_keys', JSON.stringify(local))
      }
      
      const updated = {}
      PROVIDERS.forEach(p => { updated[p.id] = (p.id === activeProvider && !!apiKey) })
      setSavedKeys(updated)
      setSavedKey(true)
      setTimeout(() => setSavedKey(false), 3000)
    } catch (e) { 
      alert('Failed to save API key: ' + (e.response?.data?.error || e.message))
    } finally { 
      setSavingKey(false) 
    }
  }

  const handleSave = async () => {
    if (!isLoggedIn) {
      alert('Please log in to save profile settings')
      return
    }
    setSaving(true)
    try {
      await updateSettings({ 
        name, 
        aiProvider: activeProvider, 
        aiModel: activeModel, 
        aiApiKey: apiKey || '' 
      })
      setUser(prev => ({ ...prev, name, aiProvider: activeProvider, aiModel: activeModel, aiApiKey: apiKey }))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) { 
      alert('Failed to save settings: ' + (e.response?.data?.error || e.message))
    } finally { 
      setSaving(false) 
    }
  }

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required')
      return
    }
    
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    
    setChangingPassword(true)
    try {
      await changePassword(currentPassword, newPassword, confirmPassword)
      setPasswordChanged(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordChanged(false), 3000)
    } catch (err) {
      console.error('Password change error:', err)
      setPasswordError(err.response?.data?.error || err.message || 'Failed to change password')
    } finally {
      setChangingPassword(false)
    }
  }

  const fpStartCooldown = () => {
    setFpCooldown(60)
    const t = setInterval(() => {
      setFpCooldown(s => { if (s <= 1) { clearInterval(t); return 0 } return s - 1 })
    }, 1000)
  }

  const handleFpSendOtp = async (e) => {
    e?.preventDefault()
    setFpError(''); setFpNotReg(false)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(fpEmail)) { setFpError('Please enter a valid email address (e.g. name@mail.com)'); return }
    setFpLoading(true)
    try {
      await forgotPassword(fpEmail)
      setFpStep(2); fpStartCooldown()
    } catch (err) {
      if (err.response?.data?.notRegistered) setFpNotReg(true)
      else setFpError(err.response?.data?.error || 'Failed to send OTP')
    } finally { setFpLoading(false) }
  }

  const handleFpVerifyOtp = async (e) => {
    e.preventDefault()
    setFpError(''); setFpLoading(true)
    try {
      const data = await verifyOtp(fpEmail, fpOtp)
      setFpResetToken(data.resetToken); setFpStep(3)
    } catch (err) {
      setFpError(err.response?.data?.error || 'Invalid OTP')
    } finally { setFpLoading(false) }
  }

  const handleFpReset = async (e) => {
    e.preventDefault()
    setFpError(''); setFpLoading(true)
    try {
      await resetPassword(fpResetToken, fpNewPass, fpConfirm)
      setFpSuccess('Password reset successfully! You can now sign in with your new password.')
    } catch (err) {
      setFpError(err.response?.data?.error || 'Reset failed')
    } finally { setFpLoading(false) }
  }

  const resetFpFlow = () => {
    setFpOpen(false); setFpStep(1); setFpEmail(''); setFpOtp('')
    setFpResetToken(''); setFpNewPass(''); setFpConfirm('')
    setFpError(''); setFpSuccess(''); setFpNotReg(false); setFpCooldown(0)
  }

  const selected = PROVIDERS.find(p => p.id === activeProvider) || PROVIDERS[0]

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-[#A6ADFF]">
      <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
    </div>
  )

  return (
    <>
    <div className="max-w-5xl mx-auto space-y-10 text-gray-700 dark:text-slate-300 px-4 pb-16">
      {/* Header */}
      <section className="mb-8">
        <h2 className="text-[32px] font-bold tracking-tight text-gray-900 dark:text-white mb-2">Settings</h2>
        <p className="text-gray-600 dark:text-slate-400 text-[15px] font-medium">Manage your digital identity and account preferences.</p>
      </section>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-12 gap-y-10">
        
        {/* Left Nav */}
        <div className="lg:col-span-1 space-y-1 flex flex-col">
          <button
            onClick={() => scrollToSection(profileRef)}
            className="w-full flex items-center gap-3.5 px-5 py-3.5 rounded-xl bg-blue-600/10 dark:bg-[#20243C] text-blue-600 dark:text-[#A6ADFF] transition-all font-bold border-2 border-blue-600/20 dark:border-transparent shadow-sm hover:shadow-md hover:bg-blue-600/15 dark:hover:bg-white/[0.04]"
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
            <span className="text-[15px]">Personal</span>
          </button>
          
          <button
            onClick={() => scrollToSection(securityRef)}
            className="w-full flex items-center gap-3.5 px-5 py-3.5 rounded-xl text-gray-700 dark:text-slate-400 hover:text-blue-600 dark:hover:text-slate-200 hover:bg-blue-600/5 dark:hover:bg-white/[0.04] transition-all font-bold border-2 border-transparent hover:border-blue-600/10 dark:hover:border-transparent hover:shadow-md"
          >
            <span className="material-symbols-outlined text-[20px]">security</span>
            <span className="text-[15px]">Security</span>
          </button>

          {/* AI Provider moved below Security to match design flow */}
          <button
            onClick={() => scrollToSection(aiRef)}
            className="w-full flex items-center gap-3.5 px-5 py-3.5 rounded-xl text-gray-700 dark:text-slate-400 hover:text-blue-600 dark:hover:text-slate-200 hover:bg-blue-600/5 dark:hover:bg-white/[0.04] transition-all font-bold border-2 border-transparent hover:border-blue-600/10 dark:hover:border-transparent hover:shadow-md"
          >
            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            <span className="text-[15px]">AI Models</span>
          </button>

          <button
            onClick={() => scrollToSection(billingRef)}
            className="w-full flex items-center gap-3.5 px-5 py-3.5 rounded-xl text-gray-700 dark:text-slate-400 hover:text-blue-600 dark:hover:text-slate-200 hover:bg-blue-600/5 dark:hover:bg-white/[0.04] transition-all font-bold border-2 border-transparent hover:border-blue-600/10 dark:hover:border-transparent hover:shadow-md"
          >
            <span className="material-symbols-outlined text-[20px]">payments</span>
            <span className="text-[15px]">Billing</span>
          </button>

          <button
            className="w-full flex items-center gap-3.5 px-5 py-3.5 rounded-xl text-gray-700 dark:text-slate-400 hover:text-blue-600 dark:hover:text-slate-200 hover:bg-blue-600/5 dark:hover:bg-white/[0.04] transition-all font-bold border-2 border-transparent hover:border-blue-600/10 dark:hover:border-transparent hover:shadow-md"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="text-[15px]">Notifications</span>
          </button>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-3 space-y-16">

          {/* Personal Profile Section */}
          <div className="space-y-8 scroll-mt-8" ref={profileRef} id="profile">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 dark:bg-[#20243C] flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 dark:text-[#A6ADFF]">person</span>
              </div>
              <h4 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-wide">Personal Profile</h4>
            </div>

            {isLoggedIn ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-gray-600 dark:text-slate-400 ml-1">Full Name</label>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onBlur={handleSave}
                    className="w-full bg-gray-50 dark:bg-[#131722] border-2 border-gray-200 dark:border-transparent focus:border-blue-600 dark:focus:border-[#A6ADFF] focus:ring-1 focus:ring-blue-600 dark:focus:ring-[#A6ADFF] rounded-xl px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 transition-all outline-none text-[15px] font-semibold"
                    type="text"
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-gray-600 dark:text-slate-400 ml-1">Email Address</label>
                  <input
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-gray-50 dark:bg-[#131722] border-2 border-gray-200 dark:border-transparent rounded-xl px-4 py-3.5 text-gray-500 dark:text-slate-400 cursor-not-allowed text-[15px] font-semibold"
                    type="email"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-[#161B28] p-6 rounded-2xl border-2 border-gray-200 dark:border-slate-800">
                <p className="text-sm text-gray-700 dark:text-slate-400 text-center font-bold">
                  <span className="text-blue-600 dark:text-[#A6ADFF] font-bold">Log in</span> to manage your profile settings.
                </p>
              </div>
            )}
          </div>

          <div className="w-full h-px bg-gray-200 dark:bg-slate-800/50"></div>

          {/* Security Section */}
          <div className="space-y-8 scroll-mt-8" ref={securityRef} id="security">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-pink-400/10 dark:bg-[#2E1E35] flex items-center justify-center">
                <span className="material-symbols-outlined text-pink-400">lock</span>
              </div>
              <h4 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-wide">Security</h4>
            </div>

            {isLoggedIn ? (
              <div className="bg-gray-50 dark:bg-[#161B2B] p-8 rounded-[24px] border border-gray-200 dark:border-transparent">
                <h5 className="text-[17px] font-bold mb-6 text-gray-900 dark:text-white">Change Password</h5>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[13px] font-semibold text-gray-600 dark:text-slate-400 ml-1">Current Password</label>
                    <div className="relative">
                      <input
                        value={currentPassword}
                        onChange={e => { setCurrentPassword(e.target.value); setPasswordError('') }}
                        className="w-full bg-white dark:bg-[#0D111C] border-2 border-gray-200 dark:border-transparent focus:border-blue-600 dark:focus:border-[#A6ADFF] focus:ring-1 focus:ring-blue-600 dark:focus:ring-[#A6ADFF] rounded-xl px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 outline-none transition-all text-[15px] pr-12 font-semibold"
                        placeholder="••••••••••••"
                        type={showCurrentPassword ? 'text' : 'password'}
                      />
                      <button
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">{showCurrentPassword ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setFpOpen(true); setFpEmail(user?.email || '') }}
                      className="group mt-2.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-slate-200 dark:border-white/10 hover:border-[#A6ADFF]/40 dark:hover:border-[#A6ADFF]/40 bg-transparent hover:bg-[#A6ADFF]/5 transition-all duration-200 w-fit"
                    >
                      <span className="material-symbols-outlined text-[13px] text-slate-400 dark:text-slate-500 group-hover:text-[#A6ADFF] transition-colors duration-200">lock_reset</span>
                      <span className="text-[12px] font-semibold text-slate-400 dark:text-slate-500 group-hover:text-[#A6ADFF] transition-colors duration-200 tracking-wide">Forgot your password?</span>
                      <span className="material-symbols-outlined text-[11px] text-slate-300 dark:text-slate-600 group-hover:text-[#A6ADFF]/70 group-hover:translate-x-0.5 transition-all duration-200">arrow_forward</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold text-gray-600 dark:text-slate-400 ml-1">New Password</label>
                      <div className="relative">
                        <input
                          value={newPassword}
                          onChange={e => { setNewPassword(e.target.value); setPasswordError('') }}
                          className="w-full bg-white dark:bg-[#0D111C] border-2 border-gray-200 dark:border-transparent focus:border-blue-600 dark:focus:border-[#A6ADFF] focus:ring-1 focus:ring-blue-600 dark:focus:ring-[#A6ADFF] rounded-xl px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 outline-none transition-all text-[15px] pr-12 font-semibold"
                          placeholder="Minimum 6 chars"
                          type={showNewPassword ? 'text' : 'password'}
                        />
                        <button
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">{showNewPassword ? 'visibility_off' : 'visibility'}</span>
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[13px] font-semibold text-gray-600 dark:text-slate-400 ml-1">Confirm Password</label>
                      <div className="relative">
                        <input
                          value={confirmPassword}
                          onChange={e => { setConfirmPassword(e.target.value); setPasswordError('') }}
                          className="w-full bg-white dark:bg-[#0D111C] border-2 border-gray-200 dark:border-transparent focus:border-blue-600 dark:focus:border-[#A6ADFF] focus:ring-1 focus:ring-blue-600 dark:focus:ring-[#A6ADFF] rounded-xl px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 outline-none transition-all text-[15px] pr-12 font-semibold"
                          placeholder="Must match new password"
                          type={showConfirmPassword ? 'text' : 'password'}
                        />
                        <button
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px]">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  {passwordError && (
                    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-semibold bg-red-500/10 border border-red-500/20 text-red-400">
                      <span className="material-symbols-outlined text-[18px]">error</span>
                      {passwordError}
                    </div>
                  )}
                  {passwordChanged && (
                    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-semibold bg-green-500/10 border border-green-500/20 text-green-400">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                      Password changed successfully!
                    </div>
                  )}
                  <div className="pt-2">
                    <button
                      onClick={handleChangePassword}
                      disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}
                      className="bg-[#B4B9FF] text-[#0B0F19] font-bold text-[14px] px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#9FA5FC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-max"
                    >
                      {changingPassword ? (
                        <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>Updating...</>
                      ) : (
                        <><span>Update Password</span><span className="material-symbols-outlined text-[18px]">arrow_forward</span></>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-[#161B28] p-6 rounded-2xl border-2 border-gray-200 dark:border-slate-800">
                <p className="text-sm text-gray-700 dark:text-slate-400 text-center font-bold">
                  <span className="text-blue-600 dark:text-[#A6ADFF] font-bold">Log in</span> to change your password.
                </p>
              </div>
            )}
          </div>

          <div className="w-full h-px bg-gray-200 dark:bg-slate-800/50"></div>

          {/* AI Provider Section */}
          <div className="space-y-8 scroll-mt-8" ref={aiRef} id="ai">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-400/10 dark:bg-[#1D273A] flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-400">smart_toy</span>
              </div>
              <h4 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-wide">AI Models</h4>
            </div>

            <div className="space-y-4">
              <label className="text-[13px] font-semibold text-gray-600 dark:text-slate-400">Select AI Provider</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PROVIDERS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleProviderChange(p.id)}
                    className={`p-5 rounded-xl border-2 text-left transition-all relative ${
                      activeProvider === p.id
                        ? 'border-blue-600/40 bg-blue-600/5 dark:border-[#A6ADFF]/40 dark:bg-[#A6ADFF]/5 shadow-md'
                        : 'border-gray-200 dark:border-slate-800/60 bg-gray-50 dark:bg-[#161B2B] hover:border-blue-600/20 dark:hover:border-slate-700 hover:shadow-lg'
                    }`}
                  >
                    {activeProvider === p.id && (
                      <span className="absolute top-4 right-4 w-5 h-5 bg-blue-600 dark:bg-[#A6ADFF] rounded-full flex items-center justify-center shadow-md">
                        <span className="material-symbols-outlined text-white dark:text-[#0B0F19] text-[14px] font-bold">check</span>
                      </span>
                    )}
                    {savedKeys[p.id] && activeProvider !== p.id && (
                      <span className="absolute top-4 right-4 w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.5)]" title="Key saved" />
                    )}
                    <div className="flex items-center gap-3 mb-2.5">
                      <span className="text-[22px]">{p.icon}</span>
                      <span className={`text-[15px] font-bold ${activeProvider === p.id ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-slate-300'}`}>{p.name}</span>
                    </div>
                    <p className="text-[12px] text-gray-700 dark:text-slate-400 leading-relaxed mb-3 pr-4 font-semibold">{p.description}</p>
                    <span className={`inline-block text-[10px] font-bold px-2.5 py-1 rounded-lg border ${p.badgeColor}`}>{p.badge}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* API Key Input */}
            <div className="bg-gray-50 dark:bg-[#161B2B] p-6 rounded-2xl border-2 border-gray-200 dark:border-slate-800/60 space-y-5">
              <div className="flex items-center justify-between">
                <label className="text-[14px] font-semibold text-gray-900 dark:text-white">
                  <span className={selected.color}>{selected.name}</span> API Key
                </label>
                <a
                  href={selected.getKeyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`flex items-center gap-1 px-3 py-1.5 ${selected.bg} border ${selected.border} ${selected.color} text-[11px] font-bold rounded-lg hover:opacity-80 transition-all`}
                >
                  <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                  Get Free Key
                </a>
              </div>

              <div className="relative">
                <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 ${selected.bg} border ${selected.border} rounded-lg flex items-center justify-center text-[16px]`}>
                  {selected.icon}
                </div>
                <input
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={e => { setApiKey(e.target.value); setTestResult(null); setSavedKey(false) }}
                  placeholder={selected.placeholder}
                  className="w-full bg-white dark:bg-[#0D111C] border-2 border-gray-200 dark:border-transparent focus:border-blue-600 dark:focus:border-[#A6ADFF] focus:ring-1 focus:ring-blue-600 dark:focus:ring-[#A6ADFF] rounded-xl pl-14 pr-28 py-4 text-[14px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 outline-none transition-all font-mono tracking-wide font-semibold"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="p-1 text-gray-400 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-[20px]">{showKey ? 'visibility_off' : 'visibility'}</span>
                  </button>
                  <button
                    onClick={handleTest}
                    disabled={testing || !apiKey}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-white/5 border border-gray-300 dark:border-slate-700 text-[11px] font-bold text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-all disabled:opacity-40"
                  >
                    {testing ? (
                      <span className="material-symbols-outlined animate-spin text-[14px]">progress_activity</span>
                    ) : (
                      <span className="material-symbols-outlined text-[14px]">bolt</span>
                    )}
                    {testing ? 'Testing' : 'Test'}
                  </button>
                </div>
              </div>

              {testResult && (
                <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-semibold ${
                  testResult.ok
                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                }`}>
                  <span className="material-symbols-outlined text-[18px]">{testResult.ok ? 'check_circle' : 'error'}</span>
                  {testResult.msg}
                </div>
              )}
            </div>

            {/* Model Selection */}
            <div className="space-y-3">
              <label className="text-[13px] font-semibold text-gray-600 dark:text-slate-400">Select Model <span className="text-gray-500 dark:text-slate-500 font-normal">(optional)</span></label>
              <select
                value={activeModel}
                onChange={e => setActiveModel(e.target.value)}
                className="w-full bg-gray-50 dark:bg-[#131722] border-2 border-gray-200 dark:border-transparent focus:border-blue-600 dark:focus:border-[#A6ADFF] focus:ring-1 focus:ring-blue-600 dark:focus:ring-[#A6ADFF] rounded-xl px-4 py-3.5 text-[14px] text-gray-900 dark:text-white outline-none transition-all appearance-none cursor-pointer font-semibold"
                style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.2em' }}
              >
                <option value="">Default Recommended</option>
                {selected.models.map(m => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Save Key Button */}
            <button
              onClick={handleSaveApiKey}
              disabled={savingKey || !apiKey}
              className="bg-[#B4B9FF] text-[#0B0F19] font-bold text-[14px] px-8 py-3.5 rounded-xl flex items-center gap-2 hover:bg-[#9FA5FC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingKey ? (
                <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>Saving...</>
              ) : savedKey ? (
                <><span className="material-symbols-outlined text-[18px]">check_circle</span>Saved!</>
              ) : savedKeys[activeProvider] ? (
                <><span className="material-symbols-outlined text-[18px]">check_circle</span>Already Saved</>
              ) : (
                <><span>Save Configuration</span><span className="material-symbols-outlined text-[18px]">arrow_forward</span></>
              )}
            </button>
          </div>

          <div className="w-full h-px bg-gray-200 dark:bg-slate-800/50"></div>

          {/* Billing Section */}
          <div className="space-y-8 scroll-mt-8" ref={billingRef} id="billing">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-300/10 dark:bg-[#232840] flex items-center justify-center">
                <span className="material-symbols-outlined text-indigo-400 dark:text-indigo-300">workspace_premium</span>
              </div>
              <h4 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-wide">Account Details</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plan Card */}
              <div className="bg-gradient-to-br from-gray-100 to-gray-50 dark:from-[#1E223D] dark:to-[#161A2D] p-7 rounded-[24px] border border-gray-200 dark:border-[#2B3050] relative overflow-hidden group hover:shadow-lg transition-all">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 dark:bg-[#A6ADFF]/10 rounded-full blur-3xl" />
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-primary dark:text-[#A6ADFF] text-[11px] font-black uppercase tracking-[0.15em] mb-1.5">Current Plan</p>
                    <h5 className="text-[26px] font-bold text-gray-900 dark:text-white tracking-wide">Luminary Pro</h5>
                  </div>
                  <div className="w-9 h-9 bg-primary dark:bg-[#A6ADFF] rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(166,173,255,0.3)]">
                    <span className="material-symbols-outlined text-white dark:text-[#1E223D] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-gray-900 dark:text-white font-bold text-[18px]">$24.00<span className="text-[13px] text-gray-600 dark:text-slate-400 font-medium">/mo</span></span>
                  <span className="text-[11px] bg-gray-200 dark:bg-[#2A2F52] text-primary dark:text-[#A6ADFF] px-3 py-1.5 rounded-full font-bold tracking-wide">Renewal: Dec 12, 2024</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-[#161B2B] p-5 rounded-[20px] flex items-center gap-4 hover:bg-gray-100 dark:hover:bg-[#1A2033] transition-all cursor-pointer border border-gray-200 dark:border-transparent hover:border-gray-300 dark:hover:border-slate-800 hover:shadow-md">
                  <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-[#202538] flex items-center justify-center">
                    <span className="material-symbols-outlined text-gray-700 dark:text-slate-300 text-[20px]">credit_card</span>
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-gray-900 dark:text-white">Payment Method</p>
                    <p className="text-[12px] text-gray-600 dark:text-slate-400 mt-0.5 font-medium">Visa ending in 4242</p>
                  </div>
                  <span className="material-symbols-outlined ml-auto text-gray-400 dark:text-slate-500 text-[18px]">chevron_right</span>
                </div>

                <div className="bg-gray-50 dark:bg-[#161B2B] p-5 rounded-[20px] flex items-center gap-4 hover:bg-gray-100 dark:hover:bg-[#1A2033] transition-all cursor-pointer border border-gray-200 dark:border-transparent hover:border-gray-300 dark:hover:border-slate-800 hover:shadow-md">
                  <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-[#202538] flex items-center justify-center">
                    <span className="material-symbols-outlined text-gray-700 dark:text-slate-300 text-[20px]">receipt_long</span>
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-gray-900 dark:text-white">Download Invoices</p>
                    <p className="text-[12px] text-gray-600 dark:text-slate-400 mt-0.5 font-medium">Last: Nov 12, 2023</p>
                  </div>
                  <span className="material-symbols-outlined ml-auto text-gray-400 dark:text-slate-500 text-[18px]">chevron_right</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

      {/* Forgot Password Modal */}

      {fpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#161B2B] rounded-[24px] border border-gray-200 dark:border-slate-800 p-8 w-full max-w-md shadow-2xl relative">
            <button
              onClick={resetFpFlow}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-pink-400/10 dark:bg-[#2E1E35] flex items-center justify-center">
                <span className="material-symbols-outlined text-pink-400">lock_reset</span>
              </div>
              <h4 className="text-[20px] font-bold text-gray-900 dark:text-white">Reset Password</h4>
            </div>

            {/* Step indicators */}
            <div className="flex items-center gap-2 mb-8">
              {[1,2,3].map(s => (
                <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${
                  fpSuccess ? 'bg-green-400' : s <= fpStep ? 'bg-[#A6ADFF]' : 'bg-gray-200 dark:bg-slate-700'
                }`} />
              ))}
            </div>

            {fpSuccess ? (
              <div className="text-center space-y-4">
                <span className="material-symbols-outlined text-green-400 text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <p className="text-[15px] font-semibold text-gray-900 dark:text-white">{fpSuccess}</p>
                <button onClick={resetFpFlow} className="bg-[#B4B9FF] text-[#0B0F19] font-bold text-[14px] px-6 py-3 rounded-xl hover:bg-[#9FA5FC] transition-colors">
                  Done
                </button>
              </div>
            ) : fpStep === 1 ? (
              <form onSubmit={handleFpSendOtp} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-gray-600 dark:text-slate-400">Email Address</label>
                  <input
                    type="email"
                    value={fpEmail}
                    onChange={e => { setFpEmail(e.target.value); setFpError(''); setFpNotReg(false) }}
                    placeholder="name@example.com"
                    className="w-full bg-gray-50 dark:bg-[#0D111C] border-2 border-gray-200 dark:border-transparent focus:border-blue-600 dark:focus:border-[#A6ADFF] rounded-xl px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 outline-none transition-all text-[15px] font-semibold"
                  />
                </div>
                {fpNotReg && (
                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-semibold bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                    <span className="material-symbols-outlined text-[18px]">info</span>
                    No account found. <Link to="/register" onClick={resetFpFlow} className="underline ml-1">Register here</Link>
                  </div>
                )}
                {fpError && (
                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-semibold bg-red-500/10 border border-red-500/20 text-red-400">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    {fpError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={fpLoading || !fpEmail}
                  className="w-full bg-[#B4B9FF] text-[#0B0F19] font-bold text-[14px] py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#9FA5FC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {fpLoading ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>Sending...</> : <>Send OTP <span className="material-symbols-outlined text-[18px]">send</span></>}
                </button>
              </form>
            ) : fpStep === 2 ? (
              <form onSubmit={handleFpVerifyOtp} className="space-y-5">
                <p className="text-[13px] text-gray-600 dark:text-slate-400 font-medium">OTP sent to <span className="text-gray-900 dark:text-white font-bold">{fpEmail}</span></p>
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-gray-600 dark:text-slate-400">Enter OTP</label>
                  <input
                    type="text"
                    value={fpOtp}
                    onChange={e => { setFpOtp(e.target.value); setFpError('') }}
                    placeholder="6-digit code"
                    maxLength={6}
                    className="w-full bg-gray-50 dark:bg-[#0D111C] border-2 border-gray-200 dark:border-transparent focus:border-blue-600 dark:focus:border-[#A6ADFF] rounded-xl px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 outline-none transition-all text-[20px] font-bold tracking-[0.5em] text-center"
                  />
                </div>
                {fpError && (
                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-semibold bg-red-500/10 border border-red-500/20 text-red-400">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    {fpError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={fpLoading || fpOtp.length < 6}
                  className="w-full bg-[#B4B9FF] text-[#0B0F19] font-bold text-[14px] py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#9FA5FC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {fpLoading ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>Verifying...</> : <>Verify OTP <span className="material-symbols-outlined text-[18px]">verified</span></>}
                </button>
                <div className="text-center">
                  {fpCooldown > 0 ? (
                    <span className="text-[12px] text-gray-500 dark:text-slate-500">Resend in {fpCooldown}s</span>
                  ) : (
                    <button type="button" onClick={handleFpSendOtp} className="text-[12px] text-blue-500 dark:text-[#A6ADFF] hover:underline font-semibold">Resend OTP</button>
                  )}
                </div>
              </form>
            ) : (
              <form onSubmit={handleFpReset} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-gray-600 dark:text-slate-400">New Password</label>
                  <input
                    type="password"
                    value={fpNewPass}
                    onChange={e => { setFpNewPass(e.target.value); setFpError('') }}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-gray-50 dark:bg-[#0D111C] border-2 border-gray-200 dark:border-transparent focus:border-blue-600 dark:focus:border-[#A6ADFF] rounded-xl px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 outline-none transition-all text-[15px] font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-semibold text-gray-600 dark:text-slate-400">Confirm Password</label>
                  <input
                    type="password"
                    value={fpConfirm}
                    onChange={e => { setFpConfirm(e.target.value); setFpError('') }}
                    placeholder="Must match new password"
                    className="w-full bg-gray-50 dark:bg-[#0D111C] border-2 border-gray-200 dark:border-transparent focus:border-blue-600 dark:focus:border-[#A6ADFF] rounded-xl px-4 py-3.5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-600 outline-none transition-all text-[15px] font-semibold"
                  />
                </div>
                {fpError && (
                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-semibold bg-red-500/10 border border-red-500/20 text-red-400">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    {fpError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={fpLoading || !fpNewPass || !fpConfirm}
                  className="w-full bg-[#B4B9FF] text-[#0B0F19] font-bold text-[14px] py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#9FA5FC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {fpLoading ? <><span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>Resetting...</> : <>Reset Password <span className="material-symbols-outlined text-[18px]">lock_reset</span></>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}