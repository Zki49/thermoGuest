const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const logUser = require('../middleware/logUser');
const authorizeRole = require('../middleware/authorizeRole');
//const authMiddleware = require('../middleware/authMiddleware');

// Appliquer le middleware d'authentification à toutes les routes
//router.use(authMiddleware);

// Routes pour les documents
router.get('/documents/:id/pdf', logUser, documentController.generatePdf);

router.get('/documents', logUser, authorizeRole(['admin', 'user']), documentController.getAllDocuments);
router.get('/documents/:id',logUser, authorizeRole(['admin']), documentController.getDocumentById);
router.post('/documents', logUser, authorizeRole(['admin']), documentController.createDocument);
router.put('/documents/:id', logUser, authorizeRole(['admin']), documentController.updateDocument);
router.delete('/documents/:id', logUser, authorizeRole(['admin']), documentController.deleteDocument);


module.exports = router; 