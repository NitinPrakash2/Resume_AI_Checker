const express    = require('express')
const router     = express.Router()
const upload     = require('../middleware/upload')
const auth       = require('../middleware/auth')
const verifyCsrf = require('../middleware/verifyCsrf')
const {
  uploadResume, getResult, getHistory,
  runATS, rewriteResume, deleteResume,
} = require('../controllers/resumeController')

router.post('/upload',        verifyCsrf, auth, upload.single('resume'), uploadResume)
router.get('/history',        auth, getHistory)
router.get('/result/:id',     auth, getResult)
router.post('/ats/:id',       verifyCsrf, auth, runATS)
router.post('/rewrite/:id',   verifyCsrf, auth, rewriteResume)
router.delete('/:id',         verifyCsrf, auth, deleteResume)

module.exports = router
