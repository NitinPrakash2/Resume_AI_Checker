const fs       = require('fs')
const path     = require('path')
const pdfParse = require('pdf-parse')
const mammoth  = require('mammoth')
const Resume   = require('../models/Resume')
const User     = require('../models/User')
const ai       = require('../services/aiService')

const UPLOADS_DIR = path.resolve(__dirname, '..', 'uploads')

const ALLOWED_EXTS = new Set(['.pdf', '.doc', '.docx'])

async function extractText(filePath, originalName) {
  // Resolve and confirm the file is inside the uploads directory (CWE-22/23)
  const resolved = path.resolve(filePath)
  if (!resolved.startsWith(UPLOADS_DIR + path.sep))
    throw new Error('Invalid file path')

  // Validate extension against an explicit allowlist using only the basename
  const ext = path.extname(path.basename(originalName)).toLowerCase()
  if (!ALLOWED_EXTS.has(ext)) throw new Error('Unsupported file type')

  const buffer = fs.readFileSync(resolved)
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

// Safely delete a file only if it resolves within the uploads directory (CWE-22/23)
function safeUnlink(filePath) {
  try {
    const resolved = path.resolve(filePath)
    if (!resolved.startsWith(UPLOADS_DIR + path.sep)) return
    if (fs.existsSync(resolved)) fs.unlinkSync(resolved)
  } catch { /* ignore cleanup errors */ }
}

async function getAICfg(req) {
  // Logged-in users: always read AI config from DB
  if (req.user?.id) {
    const user = await User.findByPk(req.user.id, { attributes: ['aiProvider', 'aiApiKey', 'aiModel'] })
    if (user?.aiApiKey) return { provider: user.aiProvider || 'openrouter', apiKey: user.aiApiKey, model: user.aiModel || '' }
    return { provider: user?.aiProvider || 'openrouter', apiKey: null, model: user?.aiModel || '' }
  }
  // Guest users: read from request headers (sent from localStorage)
  return {
    provider: req.headers['x-ai-provider'] || 'openrouter',
    apiKey:   req.headers['x-ai-key']      || null,
    model:    req.headers['x-ai-model']    || ''
  }
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
    safeUnlink(req.file.path)
    res.json({ id: resume.id, savedToDb: true })
  } catch (err) {
    if (req.file) safeUnlink(req.file.path)
    next(err)
  }
}

const getResult = async (req, res, next) => {
  try {
    const resume = await Resume.findByPk(req.params.id)
    if (!resume) return res.status(404).json({ error: 'Not found' })
    if (req.user?.id && resume.userId && resume.userId !== req.user.id)
      return res.status(403).json({ error: 'Access denied' })
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
