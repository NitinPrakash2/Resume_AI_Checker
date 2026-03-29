const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Job = sequelize.define('Job', {
  id:      { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:  { type: DataTypes.UUID, allowNull: true },
  title:   { type: DataTypes.STRING, allowNull: false },
  company: { type: DataTypes.STRING, allowNull: false },
  url:     { type: DataTypes.STRING },
  location:{ type: DataTypes.STRING },
  salary:  { type: DataTypes.STRING },
  status: {
    type: DataTypes.ENUM('saved', 'applied', 'interviewing', 'offer', 'rejected'),
    defaultValue: 'saved',
  },
  notes: { type: DataTypes.TEXT },
})

module.exports = Job
