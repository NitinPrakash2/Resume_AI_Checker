const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const { getUserResumes, analyzeResume } = require('../controllers/benchmarkController')

router.get('/resumes', auth, getUserResumes)
router.get('/analyze/:resumeId', auth, analyzeResume)

module.exports = router
