const express    = require('express')
const router     = express.Router()
const auth       = require('../middleware/auth')
const verifyCsrf = require('../middleware/verifyCsrf')
const { getJobs, createJob, updateJob, deleteJob, searchAndMatch, getAISuggestedJobs } = require('../controllers/jobController')

router.get('/ai-suggested/:resumeId', auth, getAISuggestedJobs)
router.get('/search',  auth, searchAndMatch)
router.get('/',        auth, getJobs)
router.post('/',       verifyCsrf, auth, createJob)
router.put('/:id',     verifyCsrf, auth, updateJob)
router.delete('/:id',  verifyCsrf, auth, deleteJob)

module.exports = router
