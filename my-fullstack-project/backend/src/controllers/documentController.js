const Document = require('../models/Document');
const Intervention = require('../models/Intervention');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');
const InterventionStock = require('../models/InterventionStock');

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
      user_id: 3, 
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
    const { status, amount, with_tva, products, client_id } = req.body;

    const document = await Document.findByPk(id);
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    // Mise à jour des champs
    if (status) document.status = status;
    if (amount) document.amount = amount;
    if (typeof with_tva !== 'undefined') document.with_tva = with_tva;
    if (client_id) document.user_id = client_id;

    // Synchronisation des produits dans intervention_stocks
    if (products && document.intervention_id) {
      const interventionId = document.intervention_id;
      const currentStocks = await InterventionStock.findAll({ where: { intervention_id: interventionId } });
      // Suppression des stocks qui ne sont plus présents
      for (const stock of currentStocks) {
        if (!products.find(p => Number(p.stock_id) === stock.stock_id)) {
          await stock.destroy();
        }
      }
      // Ajout ou mise à jour des stocks
      for (const prod of products) {
        let stock = currentStocks.find(s => Number(s.stock_id) === Number(prod.stock_id));
        if (stock) {
          // Mise à jour si la quantité a changé
          if (stock.quantity_used !== Number(prod.quantity)) {
            stock.quantity_used = Number(prod.quantity);
            await stock.save();
          }
        } else {
          // Ajout
          await InterventionStock.create({
            intervention_id: interventionId,
            stock_id: prod.stock_id,
            quantity_used: Number(prod.quantity)
          });
        }
      }
    }

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
        include: [
          { model: Intervention },
          { model: require('../models/User'), as: 'User' }
        ]
      });
      if (!doc) {
        return res.status(404).json({ message: 'Document non trouvé' });
      }

      // Récupérer les éléments du stock pour l'intervention
      let stockItems = [];
      if (doc.intervention_id) {
        stockItems = await InterventionStock.findAll({
          where: { intervention_id: doc.intervention_id },
          include: [{ model: require('../models/Stock'), as: 'stock' }]
        });
      }

      // Création du PDF
      const pdf = new PDFDocument({ margin: 30 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=document_${doc.id}.pdf`);
      pdf.pipe(res);

      // En-tête
      pdf.fontSize(10).text('LOGO', 30, 20);
      pdf.fontSize(20).fillColor('#7CB518').text('Facture N°' + doc.id, 350, 30, { align: 'left' });
      pdf.fontSize(10).fillColor('black').text('Ville, le ' + (doc.invoice_date ? new Date(doc.invoice_date).toLocaleDateString() : '.../.../...'), 350, 55, { align: 'left' });

      // Infos entreprise
      pdf.font('Helvetica-Bold').text('Nom de l\'entreprise', 30, 70);
      pdf.font('Helvetica').text('Adresse', 30, 85);
      pdf.text('Ville et Code Postal', 30, 100);
      pdf.text('Numéro de téléphone', 30, 115);
      pdf.text('Email', 30, 130);

      // Infos client
      pdf.rect(320, 80, 180, 60).stroke();
      pdf.font('Helvetica-Bold').text('Nom du client', 330, 90);
      if (doc.User) {
        pdf.font('Helvetica').text(doc.User.first_name + ' ' + doc.User.last_name, 330, 105);
        pdf.text(doc.User.email, 330, 120);
      }

      // Tableau produits/services
      pdf.rect(30, 160, 470, 100).fillAndStroke('#C6E377', 'black');
      pdf.fillColor('black').font('Helvetica-Bold').fontSize(10);
      pdf.text('Description', 35, 165);
      pdf.text('Prix unitaire HT', 200, 165);
      pdf.text('Quantité', 320, 165);
      pdf.text('Montant HT', 400, 165);
      pdf.font('Helvetica').fontSize(10);
      let y = 185;
      let totalHT = 0;
      for (const item of stockItems) {
        const desc = item.stock ? item.stock.name : 'Produit';
        const unit = item.stock ? Number(item.stock.unit_price) : 0;
        const qty = item.quantity_used;
        const montant = unit * qty;
        totalHT += montant;
        pdf.text(desc, 35, y, { width: 150 });
        pdf.text(unit.toFixed(2) + ' €', 200, y);
        pdf.text(qty, 320, y);
        pdf.text(montant.toFixed(2) + ' €', 400, y);
        y += 18;
      }
      if (stockItems.length === 0) {
        pdf.text('Aucun produit/stock', 35, y);
        y += 18;
      }

      // Totaux
      y += 10;
      pdf.font('Helvetica-Bold').text('Total HT', 320, y);
      pdf.font('Helvetica').text(totalHT.toFixed(2) + ' €', 400, y);
      y += 15;
      const tva = doc.with_tva ? totalHT * 0.21 : 0;
      pdf.font('Helvetica-Bold').text('TVA 21%', 320, y);
      pdf.font('Helvetica').text(tva.toFixed(2) + ' €', 400, y);
      y += 15;
      pdf.font('Helvetica-Bold').text('Total TTC', 320, y);
      pdf.font('Helvetica').text((totalHT + tva).toFixed(2) + ' €', 400, y);

      // Modalités et signature
      pdf.rect(30, y + 30, 200, 60).stroke();
      pdf.text('Modalités et conditions de règlement :', 35, y + 35);
      pdf.text('Date echeance : ' + (doc.due_date ? new Date(doc.due_date).toLocaleDateString() : '.../.../...'), 35, y + 55);
      pdf.text('Signature :', 400, y + 60);
      pdf.rect(400, y + 75, 100, 30).stroke();

      // Pied de page
      pdf.fontSize(8).text('Mon entreprise - Societe ... au capital de ... euros', 30, 750);
      pdf.text('N Siret :', 30, 760);

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