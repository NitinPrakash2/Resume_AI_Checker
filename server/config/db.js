const { Sequelize } = require('sequelize')

const url = new URL(process.env.DATABASE_URL)

// Use pre-resolved IP if ISP DNS blocks the Neon hostname
const host = process.env.DB_HOST_IP || url.hostname

const sequelize = new Sequelize({
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
      servername: url.hostname, // SNI: required for Neon to route correctly when using IP
    },
  },
})

module.exports = { sequelize }
