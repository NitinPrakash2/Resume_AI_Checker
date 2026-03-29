const { Op }   = require('sequelize')
const Resume   = require('../models/Resume')
const User     = require('../models/User')
const ai       = require('../services/aiService')

async function getAICfg(req) {
  const headerKey = req.headers['x-ai-key']
  if (headerKey) {
    return {
      provider: req.headers['x-ai-provider'] || 'openrouter',
      apiKey:   headerKey,
      model:    req.headers['x-ai-model'] || '',
    }
  }
  if (req.user?.id) {
    const user = await User.findByPk(req.user.id, { attributes: ['aiProvider', 'aiApiKey', 'aiModel'] })
    if (user?.aiApiKey) return { provider: user.aiProvider, apiKey: user.aiApiKey, model: user.aiModel }
    if (user?.aiProvider) return { provider: user.aiProvider, apiKey: null, model: user.aiModel }
  }
  return { provider: req.headers['x-ai-provider'] || 'openrouter', apiKey: null, model: '' }
}

const getInterviews = async (req, res, next) => {
  try {
    const where = req.user
      ? { userId: req.user.id, questions: { [Op.ne]: null } }
      : { questions: { [Op.ne]: null } }
    
    // Get only the most recent resume with questions
    const resume = await Resume.findOne({
      attributes: ['id', 'fileName', 'questions', 'createdAt'],
      where,
      order: [['createdAt', 'DESC']],
    })
    
    if (!resume) {
      return res.json([])
    }
    
    const interviews = (resume.questions || []).map((q, i) => ({
      id: `${resume.id}-${i}`,
      resumeId: resume.id,
      fileName: resume.fileName,
      question: q,
      createdAt: resume.createdAt,
    }))
    
    res.json(interviews)
  } catch (err) { next(err) }
}

const generateQuestions = async (req, res, next) => {
  try {
    const resume = await Resume.findByPk(req.params.resumeId)
    if (!resume) return res.status(404).json({ error: 'Resume not found' })
    if (!resume.rawText) return res.status(400).json({ error: 'No raw text for this resume' })
    const cfg    = await getAICfg(req)
    const result = await ai.generateInterviewQuestions(resume.rawText, resume.jobDesc || '', cfg)
    res.json(result)
  } catch (err) { next(err) }
}

const getAnswer = async (req, res, next) => {
  try {
    const { question, resumeId } = req.body
    if (!question) return res.status(400).json({ error: 'Question is required' })
    let context = ''
    if (resumeId) {
      const resume = await Resume.findByPk(resumeId, { attributes: ['fileName', 'keywords', 'summary'] })
      if (resume) context = `Resume: ${resume.fileName}. Skills: ${(resume.keywords || []).join(', ')}. ${resume.summary || ''}`
    }
    const cfg    = await getAICfg(req)
    const result = await ai.getAIAnswer(question, context, cfg)
    res.json(result)
  } catch (err) { next(err) }
}

module.exports = { getInterviews, generateQuestions, getAnswer }
