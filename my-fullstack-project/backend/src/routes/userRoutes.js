const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const User = require('../models/User');

// Middleware de logging
router.use((req, res, next) => {
  console.log('=== ROUTE USER ===');
  console.log('Méthode:', req.method);
  console.log('URL:', req.url);
  console.log('Body:', req.body);
  next();
});

// Routes pour les utilisateurs
router.get('/users', userController.getAllUsers);
router.post('/users', userController.createUser);
router.post('/login', userController.login);
router.post('/loginAsAdmin', userController.loginAsAdmin);
router.post('/loginAsTechnician1', userController.loginAsTechnician1);
router.post('/loginAsTechnician2', userController.loginAsTechnician2);
router.get('/verify-token', userController.verifyToken);
router.get('/clients', userController.getAllClients);

// Récupérer un utilisateur par ID
router.get('/users/:id', async (req, res) => {
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