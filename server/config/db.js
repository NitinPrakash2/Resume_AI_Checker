const { Sequelize } = require('sequelize')
const dns = require('dns')
const fs  = require('fs')

function resolveHost(hostname) {
  return new Promise((resolve) => {
    dns.lookup(hostname, (err, address) => {
      if (!err && address) return resolve(address)
      const resolver = new dns.Resolver()
      resolver.setServers(['8.8.8.8', '1.1.1.1'])
      resolver.resolve4(hostname, (err2, addresses) => {
        resolve(!err2 && addresses?.length ? addresses[0] : hostname)
      })
    })
  })
}

let _sequelize = null

async function initSequelize() {
  if (_sequelize) return _sequelize

  const url      = new URL(process.env.DATABASE_URL)
  const hostname = url.hostname
  const host     = process.env.DB_HOST_IP || await resolveHost(hostname)

  // Load a custom CA cert if provided (e.g. for Supabase/RDS managed DBs).
  // DB_SSL_CA should be an absolute path to the provider's root CA .pem file.
  const sslOptions = {
    require:            true,
    rejectUnauthorized: true,
    servername:         hostname,
    ...(process.env.DB_SSL_CA && { ca: fs.readFileSync(process.env.DB_SSL_CA).toString() }),
  }

  _sequelize = new Sequelize({
    dialect: 'postgres',
    host,
    port:     Number(url.port) || 5432,
    database: url.pathname.slice(1),
    username: url.username,
    password: url.password,
    logging:  false,
    dialectOptions: { ssl: sslOptions },
  })

  return _sequelize
}

function getSequelize() {
  if (!_sequelize) throw new Error('[DB] sequelize not initialized. Call initSequelize() first.')
  return _sequelize
}

module.exports = { initSequelize, getSequelize }
