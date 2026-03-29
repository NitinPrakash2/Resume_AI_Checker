const openrouter = require('./openrouterService')
const gemini     = require('./geminiService')
const groq       = require('./groqService')
const grok       = require('./grokService')

const PROVIDERS = { openrouter, gemini, groq, grok }

async function call(fnName, provider, apiKey, model, ...args) {
  const service = PROVIDERS[provider] || openrouter

  if (!apiKey && !process.env.OPENROUTER_API_KEY && !process.env.GROQ_API_KEY &&
      !process.env.GEMINI_API_KEY && !process.env.GROK_API_KEY) {
    throw new Error('No API key configured. Please add your API key in Settings.')
  }

  try {
    return await service[fnName](...args, apiKey || null, model || null)
  } catch (err) {
    const isAuthErr = err.response?.status === 401 || err.response?.status === 403
    const isQuota   = err.response?.status === 429 || err.message?.includes('quota')

    if (isAuthErr && apiKey) {
      throw new Error(`Invalid API key for ${provider}. Please check your key in Settings.`)
    }

    // Fallback to Groq only if quota hit on a different provider and no user key
    if (isQuota && !apiKey && provider !== 'groq' &&
        process.env.GROQ_API_KEY && process.env.GROQ_API_KEY !== 'your_groq_api_key') {
      return await groq[fnName](...args, null, null)
    }

    throw err
  }
}

module.exports = {
  analyzeResume:              (text, jd, cfg = {}) => call('analyzeResume',              cfg.provider || 'openrouter', cfg.apiKey, cfg.model, text, jd),
  simulateATS:                (text, jd, cfg = {}) => call('simulateATS',                cfg.provider || 'openrouter', cfg.apiKey, cfg.model, text, jd),
  generateInterviewQuestions: (text, jd, cfg = {}) => call('generateInterviewQuestions', cfg.provider || 'openrouter', cfg.apiKey, cfg.model, text, jd),
  rewriteResume:              (text, jd, cfg = {}) => call('rewriteResume',              cfg.provider || 'openrouter', cfg.apiKey, cfg.model, text, jd),
  getAIAnswer:                (q, ctx, cfg = {})   => call('getAIAnswer',                cfg.provider || 'openrouter', cfg.apiKey, cfg.model, q, ctx),
  callAI:                     (prompt, cfg = {})   => call('generate',                   cfg.provider || 'openrouter', cfg.apiKey, cfg.model, prompt),
}
