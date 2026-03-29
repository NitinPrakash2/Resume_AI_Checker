const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Benchmark = sequelize.define('Benchmark', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  resumeId:   { type: DataTypes.UUID, allowNull: true },
  userId:     { type: DataTypes.UUID, allowNull: true },
  jobRole:    { type: DataTypes.STRING, allowNull: true },
  rankingPercentage: { type: DataTypes.INTEGER },
  hiringChance:      { type: DataTypes.INTEGER },
  result:     { type: DataTypes.TEXT },
}, { timestamps: true })

module.exports = Benchmark
