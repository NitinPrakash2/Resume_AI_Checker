const { Op }   = require('sequelize')
const Resume   = require('../models/Resume')
const User     = require('../models/User')
const ai       = require('../services/aiService')

async function getAICfg(req) {
  if (req.user?.id) {
    const user = await User.findByPk(req.user.id, { attributes: ['aiProvider', 'aiApiKey', 'aiModel'] })
    if (user?.aiApiKey) return { provider: user.aiProvider || 'openrouter', apiKey: user.aiApiKey, model: user.aiModel || '' }
    return { provider: user?.aiProvider || 'openrouter', apiKey: null, model: user?.aiModel || '' }
  }
  return { provider: req.headers['x-ai-provider'] || 'openrouter', apiKey: req.headers['x-ai-key'] || null, model: req.headers['x-ai-model'] || '' }
}

const getInterviews = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({
      attributes: ['id', 'fileName', 'questions', 'createdAt'],
      where: { userId: req.user.id, questions: { [Op.ne]: null } },
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
    const resume = await Resume.findOne({ where: { id: req.params.resumeId, userId: req.user.id } })
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
