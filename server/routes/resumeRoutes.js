const express = require('express')
const router  = express.Router()
const upload  = require('../middleware/upload')
const auth    = require('../middleware/auth')
const {
  uploadResume, getResult, getHistory,
  runATS, rewriteResume, deleteResume,
} = require('../controllers/resumeController')

// Optional auth — attaches user if valid token present, otherwise continues as guest
const optAuth = (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) return next()
  const token = header.split(' ')[1]
  if (!token || token === 'null' || token === 'undefined') return next()
  try {
    const jwt = require('jsonwebtoken')
    req.user = jwt.verify(token, process.env.JWT_SECRET)
  } catch {
    // Invalid token — continue as guest, don't block
  }
  next()
}

router.post('/upload',        optAuth, upload.single('resume'), uploadResume)
router.get('/history',        optAuth, getHistory)
router.get('/result/:id',     getResult)
router.post('/ats/:id',       runATS)
router.post('/rewrite/:id',   rewriteResume)
router.delete('/:id',         optAuth, deleteResume)

module.exports = router
