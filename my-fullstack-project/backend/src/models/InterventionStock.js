const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Intervention = require('./Intervention');
const Stock = require('./Stock');

const InterventionStock = sequelize.define('InterventionStock', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  intervention_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'interventions',
      key: 'id'
    }
  },
  stock_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'stocks',
      key: 'id'
    }
  },
  quantity_used: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'intervention_stocks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Définir les relations si nécessaire (par exemple, pour inclure le nom du stock)
InterventionStock.belongsTo(Stock, { foreignKey: 'stock_id', as: 'stock' });

module.exports = InterventionStock; 