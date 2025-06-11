const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Intervention = sequelize.define('Intervention', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  scheduled_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  client_id: {
    type: DataTypes.INTEGER,
    allowNull: false, 
  }
}, {
  timestamps: true,
  tableName: 'interventions',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Intervention; 