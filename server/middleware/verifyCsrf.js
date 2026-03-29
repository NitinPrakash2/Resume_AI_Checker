const ALLOWED_ORIGIN = (process.env.CLIENT_ORIGIN || 'http://localhost:3000').replace(/\/$/, '')

// Rejects state-mutating requests whose Origin/Referer does not match the
// allowed client origin — defence-in-depth against CSRF (CWE-352, CWE-1275).
module.exports = function verifyCsrf(req, res, next) {
  const origin  = req.headers.origin
  const referer = req.headers.referer

  const source = origin || (referer ? new URL(referer).origin : null)

  if (!source || source !== ALLOWED_ORIGIN)
    return res.status(403).json({ error: 'Forbidden: invalid request origin' })

  next()
}
