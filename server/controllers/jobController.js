const Job    = require('../models/Job')
const Resume = require('../models/Resume')
const { searchJobs, calculateMatchScore, extractJobSkills } = require('../services/adzunaService')

const getJobs = async (req, res, next) => {
  try {
    const where = req.user ? { userId: req.user.id } : {}
    const jobs = await Job.findAll({ where, order: [['createdAt', 'DESC']] })
    res.json(jobs)
  } catch (err) { next(err) }
}

const createJob = async (req, res, next) => {
  try {
    const { title, company, url, location, salary, status, notes } = req.body
    if (!title || !company) return res.status(400).json({ error: 'Title and company are required' })
    const job = await Job.create({ userId: req.user?.id || null, title, company, url, location, salary, status, notes })
    res.status(201).json(job)
  } catch (err) { next(err) }
}

const updateJob = async (req, res, next) => {
  try {
    const where = req.user ? { id: req.params.id, userId: req.user.id } : { id: req.params.id }
    const job = await Job.findOne({ where })
    if (!job) return res.status(404).json({ error: 'Not found' })
    await job.update(req.body)
    res.json(job)
  } catch (err) { next(err) }
}

const deleteJob = async (req, res, next) => {
  try {
    const where = req.user ? { id: req.params.id, userId: req.user.id } : { id: req.params.id }
    const job = await Job.findOne({ where })
    if (!job) return res.status(404).json({ error: 'Not found' })
    await job.destroy()
    res.json({ success: true })
  } catch (err) { next(err) }
}

const searchAndMatch = async (req, res, next) => {
  try {
    const { q = '', location = '', resumeId, page = 1 } = req.query
    const jobs = await searchJobs({ keywords: q, location, page: Number(page) })

    if (resumeId) {
      const resume = await Resume.findByPk(resumeId, { attributes: ['keywords', 'missing'] })
      if (resume) {
        const resumeKeywords = resume.keywords || []
        return res.json(jobs.map(job => {
          const matchScore    = calculateMatchScore(resumeKeywords, job.description || '')
          const jobSkills     = extractJobSkills(job.description || '')
          const missingSkills = jobSkills.filter(s => !resumeKeywords.some(k => k.toLowerCase() === s.toLowerCase()))
          return { ...job, matchScore, missingSkills }
        }))
      }
    }

    res.json(jobs.map(j => ({ ...j, matchScore: null, missingSkills: [] })))
  } catch (err) { next(err) }
}

const getAISuggestedJobs = async (req, res, next) => {
  try {
    const resume = await Resume.findByPk(req.params.resumeId, { attributes: ['id', 'keywords', 'rawText', 'userId'] })
    if (!resume) return res.status(404).json({ error: 'Resume not found' })

    let keywords = resume.keywords || []

    if (keywords.length === 0 && resume.rawText) {
      const techTerms = [
        'javascript','typescript','python','java','react','node','express','sql','postgresql',
        'mongodb','aws','docker','kubernetes','git','rest','graphql','css','html','vue','angular',
        'machine learning','ai','data science','figma','sketch','agile','scrum','ci/cd','linux',
        'django','flask','spring','kotlin','swift','php','ruby','rust','go','scala','next','nuxt',
        'tailwind','redux','firebase','supabase','prisma','mysql','redis','nginx','jenkins',
      ]
      const lower = resume.rawText.toLowerCase()
      keywords = techTerms.filter(t => lower.includes(t))
    }

    let searchQuery = 'software developer'
    if (keywords.length > 0) {
      const priority = ['javascript','typescript','python','java','react','node','angular','vue','go','rust','kotlin','swift']
      const priorityKw = keywords.filter(k => priority.includes(k.toLowerCase()))
      const selected = priorityKw.length > 0 ? priorityKw.slice(0, 3) : keywords.slice(0, 3)
      searchQuery = selected.join(' ')
    }

    const jobs = await searchJobs({ keywords: searchQuery, location: '', page: 1, results: 20 })

    if (keywords.length > 0) {
      const matched = jobs
        .map(job => {
          const matchScore    = calculateMatchScore(keywords, job.description || '')
          const jobSkills     = extractJobSkills(job.description || '')
          const missingSkills = jobSkills.filter(s => !keywords.some(k => k.toLowerCase() === s.toLowerCase()))
          return { ...job, matchScore, missingSkills }
        })
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10)
      return res.json(matched)
    }

    res.json(jobs.slice(0, 10).map(job => ({ ...job, matchScore: 0, missingSkills: [] })))
  } catch (err) { next(err) }
}

module.exports = { getJobs, createJob, updateJob, deleteJob, searchAndMatch, getAISuggestedJobs }
