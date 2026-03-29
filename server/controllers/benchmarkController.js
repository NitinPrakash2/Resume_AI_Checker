const Resume = require('../models/Resume')
const User = require('../models/User')
const { benchmarkResume } = require('../services/benchmarkService')
const { searchJobs } = require('../services/adzunaService')

async function getAICfg(req) {
  const headerKey = req.headers['x-ai-key']
  if (headerKey) return { provider: req.headers['x-ai-provider'] || 'openrouter', apiKey: headerKey, model: req.headers['x-ai-model'] || '' }
  if (req.user?.id) {
    const user = await User.findByPk(req.user.id, { attributes: ['aiProvider', 'aiApiKey', 'aiModel'] })
    if (user?.aiApiKey) return { provider: user.aiProvider, apiKey: user.aiApiKey, model: user.aiModel }
    if (user?.aiProvider) return { provider: user.aiProvider, apiKey: null, model: user.aiModel }
  }
  return { provider: req.headers['x-ai-provider'] || 'openrouter', apiKey: null, model: req.headers['x-ai-model'] || '' }
}

// GET /api/benchmark/analyze/:resumeId — real-time AI benchmark
const analyzeResume = async (req, res, next) => {
  try {
    const { resumeId } = req.params

    const resume = await Resume.findByPk(resumeId)
    if (!resume) return res.status(404).json({ error: 'Resume not found' })
    if (req.user?.id && resume.userId !== req.user.id) return res.status(403).json({ error: 'Access denied' })
    if (!resume.rawText) return res.status(400).json({ error: 'Resume text not available' })

    // Use top 2 keywords max — long queries return 0 results on Adzuna
    const keywords = (resume.keywords || []).slice(0, 2).join(' ') ||
      resume.fileName.replace(/\.(pdf|docx|doc)$/i, '').replace(/[-_]/g, ' ').split(' ')[0]

    const [jobs, aiConfig] = await Promise.all([
      searchJobs({ keywords, results: 5 }),
      getAICfg(req)
    ])
    const result = await benchmarkResume(resume.rawText, jobs, aiConfig)

    res.json({
      resumeId: resume.id,
      resumeName: resume.fileName,
      matchedJobs: jobs.slice(0, 5).map(j => ({
        id: j.id, title: j.title, company: j.company,
        location: j.location, salary: j.salary, url: j.url
      })),
      recruiterVerdict: result.recruiterVerdict,
      ranking: result.ranking,
      weaknesses: result.weaknesses,
      suggestions: result.suggestions,
      missingSkills: result.missingSkills,
      hiringChance: result.hiringChance,
      marketInsights: result.marketInsights
    })
  } catch (err) {
    console.error('[Benchmark] Error:', err)
    next(err)
  }
}

/**
 * GET /api/benchmark/resumes
 */
const getUserResumes = async (req, res, next) => {
  try {
    if (!req.user?.id) return res.status(401).json({ error: 'Authentication required' })
    const resumes = await Resume.findAll({
      where: { userId: req.user.id },
      attributes: ['id', 'fileName', 'score', 'atsScore', 'createdAt'],
      order: [['createdAt', 'DESC']]
    })
    res.json(resumes)
  } catch (err) {
    next(err)
  }
}

module.exports = { analyzeResume, getUserResumes }
