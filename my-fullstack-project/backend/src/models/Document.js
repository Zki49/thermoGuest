const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Intervention = require('./Intervention');
const User = require('./User');

const Document = sequelize.define('Document', {
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
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('DEVIS', 'FACTURE'),
    allowNull: false
  },
  invoice_date: {
    type: DataTypes.DATE,
    allowNull: true
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('EN_ATTENTE', 'PAYÉ', 'ANNULÉ'),
    allowNull: false,
    defaultValue: 'EN_ATTENTE'
  },
  with_tva: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'documents',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Définir les relations
Document.belongsTo(Intervention, { foreignKey: 'intervention_id' });
Document.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Document; 