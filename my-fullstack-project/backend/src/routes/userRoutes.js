const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const User = require('../models/User');
const logUser = require('../middleware/logUser');
const authorizeRole = require('../middleware/authorizeRole');


// Middleware de logging
router.use((req, res, next) => {
  console.log('=== ROUTE USER ===');
  console.log('Méthode:', req.method);
  console.log('URL:', req.url);
  console.log('Body:', req.body);
  next();
});

// Routes pour les utilisateurs
router.get('/users/technicians/available', logUser, authorizeRole(['admin']), userController.getAvailableTechnicians);
router.get('/users', logUser, authorizeRole(['admin']), userController.getAllUsers);
router.post('/users', logUser, authorizeRole(['admin']), userController.createUser);
router.post('/login', userController.login);
router.post('/loginAsAdmin', userController.loginAsAdmin);
router.post('/loginAsTechnician1', userController.loginAsTechnician1);
router.post('/loginAsTechnician2', userController.loginAsTechnician2);
router.post('/loginAsClient1', userController.loginAsClient1);
router.get('/verify-token', userController.verifyToken);
router.get('/users/clients', logUser, authorizeRole(['admin']), userController.getAllClients);
router.get('/users/technicians', logUser, authorizeRole(['admin']), userController.getAllTechnicians);
// Récupérer un utilisateur par ID (doit être après les routes spécifiques)
router.get('/users/:id', logUser, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'first_name', 'last_name', 'email', 'role']
    });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router; 