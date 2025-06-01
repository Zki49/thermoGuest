const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const UserModel = require('./User');
const DisponibiliteModel = require('./Disponibilite');

// Initialisation des modèles
const User = UserModel(sequelize, Sequelize.DataTypes);
const Disponibilite = DisponibiliteModel(sequelize, Sequelize.DataTypes);

// Associations
User.hasMany(Disponibilite, { foreignKey: 'technician_id', as: 'disponibilites' });
Disponibilite.belongsTo(User, { foreignKey: 'technician_id', as: 'technician' });

module.exports = {
  User,
  Disponibilite,
  sequelize
};