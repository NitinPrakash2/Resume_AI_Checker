import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

// ── Token store: sessionStorage for auth token (cleared on tab close),
//   localStorage only for non-sensitive AI provider preferences.
const tokenStore = {
  get: ()        => sessionStorage.getItem('token'),
  set: (v)       => { if (v && v !== 'null' && v !== 'undefined') sessionStorage.setItem('token', v) },
  remove: ()     => sessionStorage.removeItem('token'),
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getGuestAICfg() {
  // Only used for non-logged-in (guest) users
  try {
    const keys     = JSON.parse(localStorage.getItem('resumeai_api_keys') || '{}')
    const provider = localStorage.getItem('resumeai_provider') || 'openrouter'
    const model    = localStorage.getItem('resumeai_model')    || ''
    return { provider, apiKey: keys[provider] || '', model }
  } catch { return {} }
}

// Attach JWT + AI config headers to every request
api.interceptors.request.use(config => {
  const token = tokenStore.get()
  if (token) {
    // Logged-in: server reads AI config from DB — no localStorage headers needed
    config.headers.Authorization = `Bearer ${token}`
  } else {
    // Guest fallback: send localStorage AI config as headers
    const { provider, apiKey, model } = getGuestAICfg()
    if (provider) config.headers['X-AI-Provider'] = provider
    if (apiKey)   config.headers['X-AI-Key']      = apiKey
    if (model)    config.headers['X-AI-Model']    = model
  }
  return config
})

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const safeId  = (id) => (id && UUID_RE.test(String(id)) ? String(id) : null)

// ── Auth ──────────────────────────────────────────────────────────────────────
export const register = async (name, email, password) => {
  const { data } = await api.post('/auth/register', { name, email, password })
  if (data.token) tokenStore.set(data.token)
  return data
}

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password })
  if (data.token) tokenStore.set(data.token)
  return data
}

export const logout = () => {
  tokenStore.remove()
}

export const getMe = async () => {
  const { data } = await api.get('/auth/me')
  return data
}

export const updateSettings = async (settings) => {
  const { data } = await api.put('/auth/settings', settings)
  return data
}

export const testApiKey = async (provider, apiKey, model) => {
  const { data } = await api.post('/auth/test-key', { provider, apiKey, model })
  return data
}

export const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  const { data } = await api.post('/auth/change-password', { currentPassword, newPassword, confirmPassword })
  return data
}

export const forgotPassword = async (email) => {
  const res = await api.post('/auth/forgot-password', { email }, { validateStatus: () => true })
  if (res.status !== 200) throw { response: res }
  return res.data
}

export const verifyOtp = async (email, otp) => {
  const { data } = await api.post('/auth/verify-otp', { email, otp })
  return data
}

export const resetPassword = async (resetToken, newPassword, confirmPassword) => {
  const { data } = await api.post('/auth/reset-password', { resetToken, newPassword, confirmPassword })
  return data
}

// Store latest resume id in DB (via user record), not localStorage
export const uploadResume = async (file, jobDesc) => {
  const formData = new FormData()
  formData.append('resume', file)
  formData.append('jobDesc', jobDesc || '')
  const { data } = await api.post('/resume/upload', formData)
  return data
}

// Set latest resume ID in DB
export const setLatestResumeId = async (id) => {
  const { data } = await api.put('/auth/latest-resume', { latestResumeId: id })
  return data
}

// Fetch latest resume ID from DB
export const getLatestResumeId = async () => {
  try {
    const token = sessionStorage.getItem('token')
    if (!token) return null
    const { data } = await api.get('/auth/latest-resume')
    return data.latestResumeId || null
  } catch {
    return null
  }
}

export const getResult = async (id) => {
  const { data } = await api.get(`/resume/result/${safeId(id)}`)
  return data
}

export const getHistory = async () => {
  const { data } = await api.get('/resume/history')
  return data
}

export const deleteResume = async (id) => {
  const { data } = await api.delete(`/resume/${safeId(id)}`)
  return data
}

export const runATS = async (resumeId, jobDesc = '') => {
  const { data } = await api.post(`/resume/ats/${safeId(resumeId)}`, { jobDesc })
  return data
}

export const rewriteResume = async (resumeId, jobDesc = '') => {
  const { data } = await api.post(`/resume/rewrite/${safeId(resumeId)}`, { jobDesc })
  return data
}

// ── Saved API Keys ───────────────────────────────────────────────────────────
export const getSavedKeys = async () => {
  const { data } = await api.get('/auth/saved-keys')
  return data
}

export const saveApiKey = async (label, provider, apiKey, model) => {
  const { data } = await api.post('/auth/saved-keys', { label, provider, apiKey, model })
  return data
}

export const deleteSavedKey = async (keyId) => {
  const { data } = await api.delete(`/auth/saved-keys/${keyId}`)
  return data
}

// ── Jobs ──────────────────────────────────────────────────────────────────────
export const getAISuggestedJobs = async (resumeId) => {
  const { data } = await api.get(`/jobs/ai-suggested/${safeId(resumeId)}`)
  return data
}

export const getJobs = async () => {
  const { data } = await api.get('/jobs')
  return data
}

export const searchJobs = async (q = '', location = '', resumeId = null, page = 1) => {
  const safeQ        = String(q        || '').replace(/[^\w\s,.-]/g, '').trim().slice(0, 100)
  const safeLocation = String(location || '').replace(/[^\w\s,.-]/g, '').trim().slice(0, 100)
  const safePage     = Math.min(10, Math.max(1, parseInt(page, 10) || 1))
  const params = { q: safeQ, location: safeLocation, page: safePage }
  const validResumeId = safeId(resumeId)
  if (validResumeId) params.resumeId = validResumeId
  const { data } = await api.get('/jobs/search', { params })
  return data
}

export const createJob = async (job) => {
  const { data } = await api.post('/jobs', job)
  return data
}

export const updateJob = async (id, updates) => {
  const { data } = await api.put(`/jobs/${id}`, updates)
  return data
}

export const deleteJob = async (id) => {
  const { data } = await api.delete(`/jobs/${id}`)
  return data
}

// ── Interviews ────────────────────────────────────────────────────────────────
export const getInterviews = async () => {
  const { data } = await api.get('/interviews')
  return data
}

export const generateInterviewQuestions = async (resumeId) => {
  const { data } = await api.post(`/interviews/generate/${safeId(resumeId)}`)
  return data
}

export const getAIAnswer = async (question, resumeId) => {
  const { data } = await api.post('/interviews/answer', { question, resumeId })
  return data
}

// ── Benchmark ─────────────────────────────────────────────────────────────────
export const getBenchmarkResumes = async () => {
  const { data } = await api.get('/benchmark/resumes')
  return data
}

export const analyzeBenchmark = async (resumeId) => {
  const { data } = await api.get(`/benchmark/analyze/${safeId(resumeId)}`)
  return data
}
