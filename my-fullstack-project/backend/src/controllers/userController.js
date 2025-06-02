const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = require('../config/database');
const Disponibilite = require('../models/Disponibilite');
const { Op } = require('sequelize');

// Fonction pour vérifier la connexion à la base de données
const checkDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    return true;
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    return false;
  }
};

// Récupérer tous les utilisateurs
const getAllUsers = async (req, res) => {
  try {
    if (!await checkDatabaseConnection()) {
      return res.status(503).json({ message: 'Service temporairement indisponible' });
    }

    const users = await User.findAll({
      attributes: ['id', 'first_name', 'last_name', 'email']
    });
    res.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer tous les utilisateurs avec le rôle 'user'
const getAllClients = async (req, res) => {
  try {
    if (!await checkDatabaseConnection()) {
      return res.status(503).json({ message: 'Service temporairement indisponible' });
    }
    const users = await User.findAll({
      where: { role: 'user' },
      attributes: ['id', 'first_name', 'last_name', 'email']
    });
    res.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer tous les techniciens
const getAllTechnicians = async (req, res) => {
  try {
    if (!await checkDatabaseConnection()) {
      return res.status(503).json({ message: 'Service temporairement indisponible' });
    }
    const technicians = await User.findAll({
      where: { role: 'technician' },
      attributes: ['id', 'first_name', 'last_name', 'email', 'role']
    });
    res.json(technicians);
  } catch (error) {
    console.error('Erreur lors de la récupération des techniciens:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getAvailableTechnicians = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ message: 'Date requise' });

    // Cherche les techniciens qui ont une disponibilité couvrant la date sélectionnée
    const disponibilites = await Disponibilite.findAll({
      where: {
        start: { [Op.lte]: date },
        end: { [Op.gte]: date }
      }
    });

    const technicianIds = disponibilites.map(d => d.technician_id);

    // Récupère les techniciens correspondants
    const technicians = await User.findAll({
      where: {
        id: technicianIds,
        role: 'technician'
      }
    });

    res.json(technicians);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer un nouvel utilisateur
const createUser = async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer le nouvel utilisateur avec le mot de passe haché
    const user = await User.create({
      email,
      password: hashedPassword,
      first_name,
      last_name
    });

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Connexion utilisateur
const login = async (req, res) => {
  console.log('=== DÉBUT DE LA TENTATIVE DE CONNEXION ===');
  
  if (!await checkDatabaseConnection()) {
    return res.status(503).json({ 
      success: false,
      message: 'Service temporairement indisponible' 
    });
  }

  console.log('Headers reçus:', req.headers);
  console.log('Body reçu:', req.body);
  
  const { email, password } = req.body;
  console.log('Tentative de connexion avec:', { email, password });
  
  try {
    const user = await User.findOne({ where: { email } });
    console.log('Utilisateur trouvé:', user ? {
      id: user.id,
      email: user.email,
      password: user.password,
      role: user.role
    } : 'Non trouvé');

    if (!user) {
      console.log('Utilisateur non trouvé');
      return res.status(401).json({ 
        success: false,
        message: 'Identifiants invalides' 
      });
    }

    // Comparaison sécurisée des mots de passe avec bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Résultat de la comparaison des mots de passe:', isValidPassword);

    if (!isValidPassword) {
      console.log('Mot de passe incorrect');
      return res.status(401).json({ 
        success: false,
        message: 'Identifiants invalides' 
      });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log('Token généré:', token);
    console.log('=== FIN DE LA TENTATIVE DE CONNEXION ===');

    // Réponse avec toutes les informations de l'utilisateur
    const response = {
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    };

    console.log('Réponse envoyée:', response);
    res.json(response);
  } catch (error) {
    console.error('Erreur détaillée lors de la connexion:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};

// Connexion en tant qu'administrateur
const loginAsAdmin = async (req, res) => {
  if (!await checkDatabaseConnection()) {
    return res.status(503).json({ 
      success: false,
      message: 'Service temporairement indisponible' 
    });
  }

  try {
    // Rechercher l'utilisateur admin dans la base de données
    const admin = await User.findOne({ where: { role: 'admin' } });
    
    if (!admin) {
      return res.status(404).json({ 
        success: false,
        message: 'Aucun compte administrateur trouvé' 
      });
    }

    // Générer un token JWT avec le rôle admin
    const token = jwt.sign(
      { 
        id: admin.id, 
        email: admin.email,
        role: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      message: 'Connexion en tant qu\'administrateur réussie',
      token,
      user: {
        id: admin.id,
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        role: 'admin',
        created_at: admin.created_at,
        updated_at: admin.updated_at
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion en tant qu\'administrateur:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};

// Connexion en tant que technicien 1
const loginAsTechnician1 = async (req, res) => {
  if (!await checkDatabaseConnection()) {
    return res.status(503).json({ 
      success: false,
      message: 'Service temporairement indisponible' 
    });
  }

  try {
    // Rechercher le technicien 1 dans la base de données
    const technician = await User.findOne({ where: { id: 1 } });
    
    if (!technician) {
      return res.status(404).json({ 
        success: false,
        message: 'Compte technicien 1 non trouvé' 
      });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { 
        id: technician.id, 
        email: technician.email,
        role: 'technician'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      message: 'Connexion en tant que technicien 1 réussie',
      token,
      user: {
        id: technician.id,
        email: technician.email,
        first_name: technician.first_name,
        last_name: technician.last_name,
        role: 'technician',
        created_at: technician.created_at,
        updated_at: technician.updated_at
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion en tant que technicien 1:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};

// Connexion en tant que technicien 2
const loginAsTechnician2 = async (req, res) => {
  if (!await checkDatabaseConnection()) {
    return res.status(503).json({ 
      success: false,
      message: 'Service temporairement indisponible' 
    });
  }

  try {
    // Rechercher le technicien 2 dans la base de données
    const technician = await User.findOne({ where: { id: 2 } });
    
    if (!technician) {
      return res.status(404).json({ 
        success: false,
        message: 'Compte technicien 2 non trouvé' 
      });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { 
        id: technician.id, 
        email: technician.email,
        role: 'technician'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      message: 'Connexion en tant que technicien 2 réussie',
      token,
      user: {
        id: technician.id,
        email: technician.email,
        first_name: technician.first_name,
        last_name: technician.last_name,
        role: 'technician',
        created_at: technician.created_at,
        updated_at: technician.updated_at
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion en tant que technicien 2:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur serveur',
      error: error.message 
    });
  }
};

// Vérification du token
const verifyToken = async (req, res) => {
  if (!await checkDatabaseConnection()) {
    return res.status(503).json({ 
      success: false,
      message: 'Service temporairement indisponible' 
    });
  }

  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token manquant'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ where: { id: decoded.id } });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }
};

module.exports = {
  getAvailableTechnicians,
  getAllUsers,
  getAllClients,
  getAllTechnicians,
  createUser,
  login,
  loginAsAdmin,
  loginAsTechnician1,
  loginAsTechnician2,
  verifyToken,
}; 