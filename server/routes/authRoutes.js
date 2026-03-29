const express = require('express')
const router  = express.Router()
const { register, login, getMe, getLatestResume, setLatestResume, updateSettings, testApiKey, changePassword } = require('../controllers/authController')
const auth = require('../middleware/auth')

router.post('/register',        register)
router.post('/login',           login)
router.get('/me',               auth, getMe)
router.get('/latest-resume',    auth, getLatestResume)
router.put('/latest-resume',    auth, setLatestResume)
router.put('/settings',         auth, updateSettings)
router.post('/test-key',        testApiKey)
router.post('/change-password', auth, changePassword)

module.exports = router
