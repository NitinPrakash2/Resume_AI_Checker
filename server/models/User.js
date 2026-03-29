const { DataTypes } = require('sequelize')
const bcrypt = require('bcryptjs')
const { getSequelize } = require('../config/db')

const User = getSequelize().define('User', {
  id:             { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:           { type: DataTypes.STRING, allowNull: false },
  email:          { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  password:       { type: DataTypes.STRING, allowNull: false },
  aiProvider:     { type: DataTypes.STRING, defaultValue: 'openrouter' },
  aiApiKey:       { type: DataTypes.STRING },
  aiModel:        { type: DataTypes.STRING },
  savedApiKeys:   { type: DataTypes.JSON, defaultValue: [] },
  latestResumeId: { type: DataTypes.UUID, allowNull: true },
  resetOtp:           { type: DataTypes.STRING, allowNull: true },
  resetOtpExpiry:     { type: DataTypes.BIGINT, allowNull: true },
  pwdFailedAttempts:  { type: DataTypes.INTEGER, defaultValue: 0 },
  pwdLockedUntil:     { type: DataTypes.BIGINT, allowNull: true },
}, {
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 12)
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12)
      }
    },
  },
})

User.prototype.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password)
}

module.exports = User
