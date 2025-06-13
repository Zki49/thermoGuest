const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const logUser = require('../middleware/logUser');
const authorizeRole = require('../middleware/authorizeRole');


// Middleware de logging
router.use((req, res, next) => {
  console.log('=== ROUTE STOCK ===');
  console.log('Méthode:', req.method);
  console.log('URL:', req.url);
  console.log('Body:', req.body);
  next();
});

// Routes pour les stocks
/**
 * @swagger
 * /api/stocks:
 *   get:
 *     summary: Récupérer tous les stocks
 *     tags: [Stocks]
 *     responses:
 *       200:
 *         description: Liste des stocks
 */
router.get('/stocks',logUser,authorizeRole(['admin','technician']), stockController.getAllStocks);
router.post('/stocks',logUser,authorizeRole(['admin','technician']), stockController.createStock);
router.put('/stocks/:id',logUser,authorizeRole(['admin','technician']), stockController.updateStock);
router.delete('/stocks/:id',logUser,authorizeRole(['admin','technician']), stockController.deleteStock);

module.exports = router; 