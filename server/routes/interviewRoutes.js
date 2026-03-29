const express    = require('express')
const router     = express.Router()
const { getInterviews, generateQuestions, getAnswer } = require('../controllers/interviewController')
const auth       = require('../middleware/auth')
const verifyCsrf = require('../middleware/verifyCsrf')

router.get('/',                        auth, getInterviews)
router.post('/generate/:resumeId',     verifyCsrf, auth, generateQuestions)
router.post('/answer',                 verifyCsrf, auth, getAnswer)

module.exports = router
