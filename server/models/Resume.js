const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db')

const Resume = sequelize.define('Resume', {
  id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId:        { type: DataTypes.UUID, allowNull: true },
  fileName:      { type: DataTypes.STRING, allowNull: false },
  rawText:       { type: DataTypes.TEXT },
  jobDesc:       { type: DataTypes.TEXT },
  score:         { type: DataTypes.INTEGER },
  atsScore:      { type: DataTypes.INTEGER },
  summary:       { type: DataTypes.TEXT },
  strengths:     { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
  weaknesses:    { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
  suggestions:   { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
  keywords:      { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
  missing:       { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
  questions:     { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
  rewrittenText: { type: DataTypes.TEXT },
  rejectionReasons: { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
})

module.exports = Resume
