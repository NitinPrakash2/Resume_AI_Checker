const { Sequelize } = require('sequelize')
const dns = require('dns')

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

// Lazy-initialized sequelize instance
let _sequelize = null

async function initSequelize() {
  if (_sequelize) return _sequelize

  const url = new URL(process.env.DATABASE_URL)
  const hostname = url.hostname
  const host = process.env.DB_HOST_IP || await resolveHost(hostname)

  _sequelize = new Sequelize({
    dialect: 'postgres',
    host,
    port: Number(url.port) || 5432,
    database: url.pathname.slice(1),
    username: url.username,
    password: url.password,
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
        servername: hostname,
      },
    },
  })

  return _sequelize
}

// Proxy: models import { sequelize } synchronously — this proxy defers actual
// method calls until initSequelize() has resolved the instance.
const sequelize = new Proxy({}, {
  get(_, prop) {
    if (!_sequelize) throw new Error('[DB] sequelize not initialized yet. Ensure initSequelize() is awaited in server.js before models are used.')
    return typeof _sequelize[prop] === 'function'
      ? _sequelize[prop].bind(_sequelize)
      : _sequelize[prop]
  }
})

module.exports = { sequelize, initSequelize }
