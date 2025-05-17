const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Feedback = sequelize.define('Feedback', {
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
    client_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'user',
            key: 'id'
        }
    },
    comment: {
        type: DataTypes.TEXT
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    }
}, {
    tableName: 'feedback',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

Feedback.belongsTo(User, { foreignKey: 'client_id', as: 'client' });

module.exports = Feedback;