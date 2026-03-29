require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const fs      = require('fs')
const path    = require('path')

const { sequelize }    = require('./config/db')
const authRoutes       = require('./routes/authRoutes')
const resumeRoutes     = require('./routes/resumeRoutes')
const jobRoutes        = require('./routes/jobRoutes')
const interviewRoutes  = require('./routes/interviewRoutes')

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir)

const app = express()
app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(express.json())

// Routes
app.use('/api/auth',       authRoutes)
app.use('/api/resume',     resumeRoutes)
app.use('/api/jobs',       jobRoutes)
app.use('/api/interviews', interviewRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: new Date() }))

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.message)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

const PORT = process.env.PORT || 5000

// Load all models before sync
require('./models/User')
require('./models/Resume')
require('./models/Job')

sequelize.sync({ alter: true }).then(() => {
  console.log('[DB] Schema synced')
  app.listen(PORT, () => console.log(`[Server] Running on port ${PORT}`))
}).catch(err => console.error('[DB] Connection failed:', err.message))
