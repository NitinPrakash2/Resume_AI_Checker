const axios = require('axios')

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'

function parseJSON(text) {
  const clean = text.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
  return JSON.parse(clean)
}

async function generate(prompt, apiKey, model) {
  const key = apiKey || process.env.OPENROUTER_API_KEY
  if (!key) throw new Error('No OpenRouter API key. Add your key in Settings.')
  const mdl = model || process.env.OPENROUTER_MODEL || 'openrouter/free'

  const maxRetries = 3
  for (let i = 0; i < maxRetries; i++) {
    try {
      const { data } = await axios.post(
        OPENROUTER_URL,
        { model: mdl, messages: [{ role: 'user', content: prompt }], temperature: 0.3 },
        {
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'ResumeAI',
          },
          timeout: 60000,
        }
      )
      const text = data.choices?.[0]?.message?.content
      if (!text) throw new Error('Empty response from OpenRouter')
      return parseJSON(text)
    } catch (err) {
      const is429 = err.response?.status === 429
      if (is429 && i < maxRetries - 1) {
        const wait = (i + 1) * 15
        console.log(`[OpenRouter] Rate limited. Retrying in ${wait}s`)
        await new Promise(r => setTimeout(r, wait * 1000))
      } else throw err
    }
  }
}

const PROMPTS = require('./prompts')

module.exports = {
  analyzeResume:              (text, jd, key, model) => generate(PROMPTS.analyzeResume(text, jd), key, model),
  simulateATS:                (text, jd, key, model) => generate(PROMPTS.simulateATS(text, jd), key, model),
  generateInterviewQuestions: (text, jd, key, model) => generate(PROMPTS.generateInterviewQuestions(text, jd), key, model),
  rewriteResume:              (text, jd, key, model) => generate(PROMPTS.rewriteResume(text, jd), key, model),
  getAIAnswer:                (q, ctx, key, model)   => generate(PROMPTS.getAIAnswer(q, ctx), key, model),
}
