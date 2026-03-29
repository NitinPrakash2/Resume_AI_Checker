const { GoogleGenerativeAI } = require('@google/generative-ai')
const PROMPTS = require('./prompts')

function parseJSON(text) {
  return JSON.parse(
    text.trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()
  )
}

async function generate(prompt, apiKey) {
  const key = apiKey || process.env.GEMINI_API_KEY
  if (!key) throw new Error('Gemini API key not configured')

  const genAI = new GoogleGenerativeAI(key)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const maxRetries = 3
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await model.generateContent(prompt)
      return parseJSON(result.response.text())
    } catch (err) {
      const is429 = err.message?.includes('429')
      if (is429 && i < maxRetries - 1) {
        const wait = (i + 1) * 20
        console.log(`[Gemini] Rate limited. Retrying in ${wait}s`)
        await new Promise(r => setTimeout(r, wait * 1000))
      } else throw err
    }
  }
}

module.exports = {
  analyzeResume:              (text, jd, key) => generate(PROMPTS.analyzeResume(text, jd), key),
  simulateATS:                (text, jd, key) => generate(PROMPTS.simulateATS(text, jd), key),
  generateInterviewQuestions: (text, jd, key) => generate(PROMPTS.generateInterviewQuestions(text, jd), key),
  rewriteResume:              (text, jd, key) => generate(PROMPTS.rewriteResume(text, jd), key),
  getAIAnswer:                (q, ctx, key)   => generate(PROMPTS.getAIAnswer(q, ctx), key),
}
