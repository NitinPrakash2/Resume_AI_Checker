const axios = require('axios')
const PROMPTS = require('./prompts')

function parseJSON(text) {
  let cleaned = text.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
  
  // Find the first { or [ and last } or ]
  const firstBrace = Math.max(cleaned.indexOf('{'), 0)
  const firstBracket = cleaned.indexOf('[')
  const start = firstBracket !== -1 && firstBracket < firstBrace ? firstBracket : firstBrace
  
  const lastBrace = cleaned.lastIndexOf('}')
  const lastBracket = cleaned.lastIndexOf(']')
  const end = Math.max(lastBrace, lastBracket)
  
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.substring(start, end + 1)
  }
  
  return JSON.parse(cleaned)
}

async function generate(prompt, apiKey) {
  const key = apiKey || process.env.GROK_API_KEY
  if (!key) throw new Error('Grok API key not configured')

  const { data } = await axios.post(
    'https://api.x.ai/v1/chat/completions',
    {
      model: 'grok-beta',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    },
    {
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    }
  )
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('Empty response from Grok')
  return parseJSON(text)
}

module.exports = {
  analyzeResume:              (text, jd, key) => generate(PROMPTS.analyzeResume(text, jd), key),
  simulateATS:                (text, jd, key) => generate(PROMPTS.simulateATS(text, jd), key),
  generateInterviewQuestions: (text, jd, key) => generate(PROMPTS.generateInterviewQuestions(text, jd), key),
  rewriteResume:              (text, jd, key) => generate(PROMPTS.rewriteResume(text, jd), key),
  getAIAnswer:                (q, ctx, key)   => generate(PROMPTS.getAIAnswer(q, ctx), key),
}
