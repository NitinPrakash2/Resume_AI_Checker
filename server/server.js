require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const fs      = require('fs')
const path    = require('path')

const { initSequelize, getSequelize } = require('./config/db')

const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir)

const app = express()
const ALLOWED_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000'
app.use(cors({ origin: ALLOWED_ORIGIN, credentials: true }))
app.use(express.json())

const PORT = process.env.PORT || 5000

async function start() {
  try {
    await initSequelize()

    require('./models/User')
    require('./models/Resume')
    require('./models/Job')

    app.use('/api/auth',       require('./routes/authRoutes'))
    app.use('/api/resume',     require('./routes/resumeRoutes'))
    app.use('/api/jobs',       require('./routes/jobRoutes'))
    app.use('/api/interviews', require('./routes/interviewRoutes'))
    app.use('/api/benchmark',  require('./routes/benchmarkRoutes'))

    app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: new Date() }))

    app.use((err, req, res, next) => {
      console.error('[Error]', err.message)
      res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
    })

    await getSequelize().sync({ alter: true })
    console.log('[DB] Schema synced')
    app.listen(PORT, () => console.log(`[Server] Running on port ${PORT}`))
  } catch (err) {
    console.error('[DB] Connection failed:', err.message)
    console.error(err.stack)
    process.exit(1)
  }
}

start()
