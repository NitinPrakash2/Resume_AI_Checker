const multer = require('multer')
const path = require('path')
const fs = require('fs')

const uploadsDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir)

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    // Strip all path separators and non-safe characters to prevent path traversal (CWE-22/23)
    const safeName = path.basename(file.originalname).replace(/[^\w.-]/g, '_')
    cb(null, `${Date.now()}-${safeName}`)
  },
})

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx']
  const ext = path.extname(path.basename(file.originalname)).toLowerCase()
  if (allowed.includes(ext)) cb(null, true)
  else cb(Object.assign(new Error('Only PDF, DOC, DOCX files are allowed'), { status: 400 }), false)
}

module.exports = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } })
