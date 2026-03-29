const express = require('express')
const router  = express.Router()
const { getInterviews, generateQuestions, getAnswer } = require('../controllers/interviewController')

router.get('/',                        getInterviews)
router.post('/generate/:resumeId',     generateQuestions)
router.post('/answer',                 getAnswer)

module.exports = router
