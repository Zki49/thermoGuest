const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

// Middleware de logging
router.use((req, res, next) => {
  console.log('=== ROUTE STOCK ===');
  console.log('Méthode:', req.method);
  console.log('URL:', req.url);
  console.log('Body:', req.body);
  next();
});

// Routes pour les stocks
router.get('/stocks', stockController.getAllStocks);
router.post('/stocks', stockController.createStock);
router.put('/stocks/:id', stockController.updateStock);
router.delete('/stocks/:id', stockController.deleteStock);

module.exports = router; 