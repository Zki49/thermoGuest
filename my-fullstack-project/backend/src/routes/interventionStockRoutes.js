const express = require('express');
const router = express.Router();
const interventionStockController = require('../controllers/interventionStockController');
const logUser = require('../middleware/logUser');
const authorizeRole = require('../middleware/authorizeRole');


// Middleware de logging (optionnel, mais utile pour le débogage)
router.use((req, res, next) => {
  console.log('=== ROUTE INTERVENTION STOCK ===');
  console.log('Méthode:', req.method);
  console.log('URL:', req.url);
  next();
});

// Route pour récupérer les stocks par ID d'intervention
router.get('/intervention-stocks/:interventionId', interventionStockController.getInterventionStocks);

module.exports = router; 