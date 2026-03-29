const fs       = require('fs')
const path     = require('path')
const pdfParse = require('pdf-parse')
const mammoth  = require('mammoth')
const Resume   = require('../models/Resume')
const User     = require('../models/User')
const ai       = require('../services/aiService')

async function extractText(filePath, originalName) {
  const ext    = path.extname(originalName).toLowerCase()
  const buffer = fs.readFileSync(filePath)
  if (ext === '.pdf') {
    const _warn = console.warn, _error = console.error, _log = console.log
    console.warn = console.error = console.log = () => {}
    try {
      const result = await pdfParse(buffer, { max: 0 })
      return result.text
    } finally {
      console.warn = _warn; console.error = _error; console.log = _log
    }
  }
  if (ext === '.docx' || ext === '.doc') return (await mammoth.extractRawText({ buffer })).value
  throw new Error('Unsupported file type')
}

async function getAICfg(req) {
  const headerKey = req.headers['x-ai-key']
  if (headerKey) {
    return { provider: req.headers['x-ai-provider'] || 'openrouter', apiKey: headerKey, model: req.headers['x-ai-model'] || '' }
  }
  if (req.user?.id) {
    const user = await User.findByPk(req.user.id, { attributes: ['aiProvider', 'aiApiKey', 'aiModel'] })
    if (user?.aiApiKey) return { provider: user.aiProvider, apiKey: user.aiApiKey, model: user.aiModel }
    if (user?.aiProvider) return { provider: user.aiProvider, apiKey: null, model: user.aiModel }
  }
  return { provider: req.headers['x-ai-provider'] || 'openrouter', apiKey: null, model: req.headers['x-ai-model'] || '' }
}

const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const text = await extractText(req.file.path, req.file.originalname)
    if (!text || text.trim().length < 50)
      return res.status(400).json({ error: 'Could not extract enough text from the file' })

    const jobDesc = req.body.jobDesc || ''
    const cfg     = await getAICfg(req)
    const result  = await ai.analyzeResume(text, jobDesc, cfg)

    const resume = await Resume.create({
      userId:           req.user?.id || null,
      fileName:         req.file.originalname,
      rawText:          text,
      jobDesc:          jobDesc || null,
      score:            result.score,
      atsScore:         result.atsScore,
      summary:          result.summary,
      strengths:        result.strengths        || [],
      weaknesses:       result.weaknesses       || [],
      suggestions:      result.suggestions      || [],
      keywords:         result.keywords         || [],
      missing:          result.missing          || [],
      questions:        result.questions        || [],
      rejectionReasons: result.rejectionReasons || [],
    })

    if (req.user?.id) {
      await User.update({ latestResumeId: resume.id }, { where: { id: req.user.id } })
    }
    fs.unlinkSync(req.file.path)
    res.json({ id: resume.id, savedToDb: true })
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path)
    next(err)
  }
}

const getResult = async (req, res, next) => {
  try {
    const resume = await Resume.findByPk(req.params.id)
    if (!resume) return res.status(404).json({ error: 'Not found' })
    res.json(resume)
  } catch (err) { next(err) }
}

const getHistory = async (req, res, next) => {
  try {
    const where = req.user ? { userId: req.user.id } : {}
    const resumes = await Resume.findAll({
      attributes: ['id', 'fileName', 'score', 'atsScore', 'createdAt'],
      where,
      order: [['createdAt', 'DESC']],
      limit: 50,
    })
    res.json(resumes)
  } catch (err) { next(err) }
}

const runATS = async (req, res, next) => {
  try {
    const resume = await Resume.findByPk(req.params.id)
    if (!resume) return res.status(404).json({ error: 'Resume not found' })
    if (!resume.rawText) return res.status(400).json({ error: 'No raw text stored' })
    const cfg    = await getAICfg(req)
    const result = await ai.simulateATS(resume.rawText, resume.jobDesc || req.body.jobDesc || '', cfg)
    res.json(result)
  } catch (err) { next(err) }
}

const rewriteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findByPk(req.params.id)
    if (!resume) return res.status(404).json({ error: 'Resume not found' })
    if (!resume.rawText) return res.status(400).json({ error: 'No raw text stored' })
    const cfg    = await getAICfg(req)
    const result = await ai.rewriteResume(resume.rawText, resume.jobDesc || req.body.jobDesc || '', cfg)
    await resume.update({ rewrittenText: result.rewrittenText })
    res.json(result)
  } catch (err) { next(err) }
}

const deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findByPk(req.params.id)
    if (!resume) return res.status(404).json({ error: 'Not found' })
    await resume.destroy()
    if (req.user?.id) {
      await User.update({ latestResumeId: null }, { where: { id: req.user.id, latestResumeId: req.params.id } })
    }
    res.json({ success: true })
  } catch (err) { next(err) }
}

module.exports = { uploadResume, getResult, getHistory, runATS, rewriteResume, deleteResume }
