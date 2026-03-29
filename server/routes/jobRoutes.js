const express = require('express')
const router  = express.Router()
const auth    = require('../middleware/auth')
const { getJobs, createJob, updateJob, deleteJob, searchAndMatch, getAISuggestedJobs } = require('../controllers/jobController')

router.get('/ai-suggested/:resumeId', getAISuggestedJobs)
router.get('/search',  searchAndMatch)
router.get('/',        auth, getJobs)
router.post('/',       auth, createJob)
router.put('/:id',     auth, updateJob)
router.delete('/:id',  auth, deleteJob)

module.exports = router
