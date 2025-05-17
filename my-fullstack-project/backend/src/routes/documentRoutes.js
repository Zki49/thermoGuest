const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
//const authMiddleware = require('../middleware/authMiddleware');

// Appliquer le middleware d'authentification à toutes les routes
//router.use(authMiddleware);

// Routes pour les documents
router.get('/documents/:id/pdf', documentController.generatePdf);
router.get('/documents', documentController.getAllDocuments);
router.get('/documents/:id', documentController.getDocumentById);
router.post('/documents', documentController.createDocument);
router.put('/documents/:id', documentController.updateDocument);
router.delete('/documents/:id', documentController.deleteDocument);


module.exports = router; 