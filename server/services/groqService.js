const Groq = require('groq-sdk')
const PROMPTS = require('./prompts')

function parseJSON(text) {
  let clean = text.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
  const start = clean.indexOf('{')
  const end = clean.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) clean = clean.slice(start, end + 1)
  clean = clean.replace(/,\s*([}\]])/g, '$1')
  return JSON.parse(clean)
}

async function generate(prompt, apiKey) {
  const key = apiKey || process.env.GROQ_API_KEY
  if (!key || key === 'your_groq_api_key') throw new Error('Groq API key not configured')

  const groq = new Groq({ apiKey: key })
  const completion = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 2048,
  })
  return parseJSON(completion.choices[0].message.content)
}

module.exports = {
  analyzeResume:              (text, jd, key) => generate(PROMPTS.analyzeResume(text, jd), key),
  simulateATS:                (text, jd, key) => generate(PROMPTS.simulateATS(text, jd), key),
  generateInterviewQuestions: (text, jd, key) => generate(PROMPTS.generateInterviewQuestions(text, jd), key),
  rewriteResume:              (text, jd, key) => generate(PROMPTS.rewriteResume(text, jd), key),
  getAIAnswer:                (q, ctx, key)   => generate(PROMPTS.getAIAnswer(q, ctx), key),
  generate:                   (prompt, key)   => generate(prompt, key),
}
