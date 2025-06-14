const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Disponibilite = sequelize.define('Disponibilite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  technician_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  start: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'disponibilites',
  timestamps: false
});

module.exports = Disponibilite;
  