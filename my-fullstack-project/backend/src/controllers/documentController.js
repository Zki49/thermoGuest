const Document = require('../models/Document');
const Intervention = require('../models/Intervention');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');
const InterventionStock = require('../models/InterventionStock');
const path = require('path');
const User = require('../models/User');
require('dotenv').config();

// Récupérer tous les documents
const getAllDocuments = async (req, res) => {
  try {
    const user = req.user;
    let where = {};
    if (user && user.role === 'user') {
      where = {
        type: 'FACTURE',
        user_id: user.id,
        invoice_date: { [Op.ne]: null },
        due_date: { [Op.ne]: null }
      };
    }
    const documents = await Document.findAll({
      where,
      include: [
        {
          model: Intervention,
          attributes: ['id', 'scheduled_date', 'description']
        },
        {
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'email']
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
          attributes: ['id', 'scheduled_date', 'description']
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
    const { status, amount, with_tva, products, client_id, invoice_date, due_date, created_at } = req.body;

    const document = await Document.findByPk(id);
    if (!document) {
      return res.status(404).json({ message: 'Document non trouvé' });
    }

    // Mise à jour des champs
    if (status) document.status = status;
    if (amount) document.amount = amount;
    if (typeof with_tva !== 'undefined') document.with_tva = with_tva;
    if (client_id) document.user_id = client_id;
    if (invoice_date) document.invoice_date = invoice_date;
    if (due_date) document.due_date = due_date;
    if (created_at) document.created_at = created_at;

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

      // En-tête avec logo
      try {
        const logoPath = path.join(__dirname, '../../assets/logo.png');
        pdf.image(logoPath, 40, 20, { width: 180 });
      } catch (e) {
        console.error("Erreur lors de l'ajout du logo :", e);
      }

      // Bloc entreprise sous le logo
      const blocY = 90;
      pdf.font('Helvetica-Bold').text(process.env.COMPANY_NAME, 40, blocY);
      pdf.font('Helvetica').text(process.env.COMPANY_ADDRESS, 40, blocY + 15);
      pdf.text(process.env.COMPANY_CITY, 40, blocY + 30);
      pdf.text(process.env.COMPANY_PHONE, 40, blocY + 45);
      pdf.text(process.env.COMPANY_EMAIL, 40, blocY + 60);

      // Facture N° et date à droite
      pdf.fontSize(20).fillColor('#7CB518').text('Facture N°' + doc.id, 350, 30, { align: 'left' });
      pdf.fontSize(10).fillColor('black').text('Ville, le ' + (doc.invoice_date ? new Date(doc.invoice_date).toLocaleDateString() : '.../.../...'), 350, 55, { align: 'left' });

      // Infos client
      pdf.rect(350, 90, 220, 60).stroke();
      pdf.font('Helvetica-Bold').text('Nom du client', 360, 100);
      if (doc.User) {
        pdf.font('Helvetica').text(doc.User.first_name + ' ' + doc.User.last_name, 360, 115);
        pdf.text(doc.User.email, 360, 130);
      }

      // Tableau produits/services
      const tableY = 170;
      const tableHeight = 25 + stockItems.length * 18;
      pdf.rect(30, tableY, 600, tableHeight).fillAndStroke('#C6E377', 'black');
      pdf.fillColor('black').font('Helvetica-Bold').fontSize(10);
      pdf.text('Description', 35, tableY + 5);
      pdf.text('Prix unitaire HT', 220, tableY + 5);
      pdf.text('Quantité', 370, tableY + 5);
      pdf.text('Montant HT', 470, tableY + 5);
      pdf.font('Helvetica').fontSize(10);
      let y = tableY + 25;
      let totalHT = 0;
      for (const item of stockItems) {
        const desc = item.stock ? item.stock.name : 'Produit';
        const unit = item.stock ? Number(item.stock.unit_price) : 0;
        const qty = item.quantity_used;
        const montant = unit * qty;
        totalHT += montant;
        pdf.text(desc, 35, y, { width: 150 });
        pdf.text(unit.toFixed(2) + ' €', 220, y);
        pdf.text(qty, 370, y);
        pdf.text(montant.toFixed(2) + ' €', 470, y);
        y += 18;
      }
      if (stockItems.length === 0) {
        pdf.text('Aucun produit/stock', 35, y);
        y += 18;
      }

      // Totaux juste sous le tableau
      y += 10;
      pdf.font('Helvetica-Bold').text('Total HT', 370, y);
      pdf.font('Helvetica').text(totalHT.toFixed(2) + ' €', 470, y);
      y += 15;
      const tva = doc.with_tva ? totalHT * 0.21 : 0;
      pdf.font('Helvetica-Bold').text('TVA 21%', 370, y);
      pdf.font('Helvetica').text(tva.toFixed(2) + ' €', 470, y);
      y += 15;
      pdf.font('Helvetica-Bold').text('Total TTC', 370, y);
      pdf.font('Helvetica').text((totalHT + tva).toFixed(2) + ' €', 470, y);

      // Modalités et signature
      pdf.rect(30, y + 30, 250, 60).stroke();
      pdf.text('Modalités et conditions de règlement :', 35, y + 35);
      pdf.text('Date echeance : ' + (doc.invoice_date ? new Date(doc.invoice_date).toLocaleDateString() : '.../.../...'), 35, y + 55);
      pdf.text('Signature :', 400, y + 60);
      pdf.rect(470, y + 55, 100, 30).stroke();

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