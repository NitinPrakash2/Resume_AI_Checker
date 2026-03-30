const express     = require('express')
const router      = express.Router()
const { register, login, getMe, getLatestResume, setLatestResume, updateSettings, testApiKey, changePassword, forgotPassword, verifyOtp, resetPassword, getSavedKeys, saveApiKey, deleteSavedKey } = require('../controllers/authController')
const auth        = require('../middleware/auth')
const verifyCsrf  = require('../middleware/verifyCsrf')

router.get('/saved-keys',          auth, getSavedKeys)
router.post('/saved-keys',         verifyCsrf, auth, saveApiKey)
router.delete('/saved-keys/:keyId',verifyCsrf, auth, deleteSavedKey)

router.post('/register',        verifyCsrf, register)
router.post('/login',           verifyCsrf, login)
router.get('/me',               auth, getMe)
router.get('/latest-resume',    auth, getLatestResume)
router.put('/latest-resume',    verifyCsrf, auth, setLatestResume)
router.put('/settings',         verifyCsrf, auth, updateSettings)
router.post('/test-key',        verifyCsrf, testApiKey)
router.post('/change-password', verifyCsrf, auth, changePassword)
router.post('/forgot-password', verifyCsrf, forgotPassword)
router.post('/verify-otp',      verifyCsrf, verifyOtp)
router.post('/reset-password',  verifyCsrf, resetPassword)

module.exports = router
