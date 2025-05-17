const Document = require('../models/Document');
const Intervention = require('../models/Intervention');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');

// Récupérer tous les documents
const getAllDocuments = async (req, res) => {
  try {
    const documents = await Document.findAll({
      include: [
        {
          model: Intervention,
          attributes: ['id', 'scheduled_date']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(documents);
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Récupérer un document par ID
const getDocumentById = async (req, res) => {
  try {
    const document = await Document.findByPk(req.params.id, {
      include: [
        {
          model: Intervention,
          attributes: ['id', 'scheduled_date']
        }
      ]
    });
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }
    res.json(document);
  } catch (error) {
    console.error('Erreur lors de la récupération du document:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer un nouveau document
const createDocument = async (req, res) => {
  try {
    const { intervention_id, amount, type } = req.body;
    
    // Vérifier si l'intervention existe
    const intervention = await Intervention.findByPk(intervention_id);
    if (!intervention) {
      return res.status(404).json({ message: 'Intervention non trouvée' });
    }

    const document = await Document.create({
      intervention_id,
      user_id: 3, // Utilisateur par défaut
      type,
      amount,
      status: 'EN_ATTENTE'
    });

    res.status(201).json(document);
  } catch (error) {
    console.error('Erreur lors de la création du document:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour un document
const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, amount } = req.body;

    const document = await Document.findByPk(id);
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    // Mise à jour des champs
    if (status) document.status = status;
    if (amount) document.amount = amount;

    await document.save();
    res.json(document);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du document:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer un document
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findByPk(id);
    
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    await document.destroy();
    res.json({ message: 'Document supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du document:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const generatePdf = async (req, res) => {
    try {
      const doc = await Document.findByPk(req.params.id, {
        include: [{ model: Intervention }]
      });
      if (!doc) {
        return res.status(404).json({ message: 'Document non trouvé' });
      }
  
      // Création du PDF
      const pdf = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=document_${doc.id}.pdf`);
      pdf.pipe(res);
  
      pdf.fontSize(20).text(doc.type === 'FACTURE' ? 'Facture' : 'Devis', { align: 'center' });
      pdf.moveDown();
      pdf.fontSize(12).text(`Numéro : ${doc.id}`);
      pdf.text(`Date de création : ${new Date(doc.created_at).toLocaleDateString()}`);
      pdf.text(`Montant : ${doc.amount} €`);
      pdf.text(`Statut : ${doc.status}`);
      pdf.moveDown();
      if (doc.Intervention) {
        pdf.text(`Intervention associée :`);
        pdf.text(`- ID : ${doc.Intervention.id}`);
        pdf.text(`- Description : ${doc.Intervention.description || ''}`);
        pdf.text(`- Date prévue : ${doc.Intervention.scheduled_date ? new Date(doc.Intervention.scheduled_date).toLocaleDateString() : ''}`);
      }
      pdf.end();
    } catch (error) {
      console.error('Erreur lors de la génération du PDF :', error);
      res.status(500).json({ message: 'Erreur serveur lors de la génération du PDF' });
    }
  };

module.exports = {
  getAllDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
  generatePdf
}; 