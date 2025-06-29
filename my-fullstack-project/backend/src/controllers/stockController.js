const Stock = require('../models/Stock');
const sequelize = require('../config/database');

// Vérifier la connexion à la base de données
const checkDatabaseConnection = async () => {
  try {
    await sequelize.authenticate();
    return true;
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    return false;
  }
};

// Récupérer tous les stocks
const getAllStocks = async (req, res) => {
  try {
    if (!await checkDatabaseConnection()) {
      return res.status(503).json({ message: 'Service temporairement indisponible' });
    }

    const stocks = await Stock.findAll({
      order: [['name', 'ASC']]
    });
    
    res.json(stocks);
  } catch (error) {
    console.error('Erreur lors de la récupération des stocks:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Créer un nouveau stock
const createStock = async (req, res) => {
  try {
    if (!await checkDatabaseConnection()) {
      return res.status(503).json({ message: 'Service temporairement indisponible' });
    }

    const { name, description, quantity, unit_price, category } = req.body;

    const stock = await Stock.create({
      name,
      description,
      quantity,
      unit_price,
      category
    });

    res.status(201).json(stock);
  } catch (error) {
    console.error('Erreur lors de la création du stock:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Mettre à jour un stock
const updateStock = async (req, res) => {
  try {
    if (!await checkDatabaseConnection()) {
      return res.status(503).json({ message: 'Service temporairement indisponible' });
    }

    const { id } = req.params;
    const { name, description, quantity, unit_price, category, quantity_min } = req.body;

    const stock = await Stock.findByPk(id);
    if (!stock) {
      return res.status(404).json({ message: 'Stock non trouvé' });
    }

    await stock.update({
      name,
      description,
      quantity,
      unit_price,
      category,
      quantity_min
    });

    res.json(stock);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du stock:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Supprimer un stock
const deleteStock = async (req, res) => {
  try {
    if (!await checkDatabaseConnection()) {
      return res.status(503).json({ message: 'Service temporairement indisponible' });
    }

    const { id } = req.params;

    const stock = await Stock.findByPk(id);
    if (!stock) {
      return res.status(404).json({ message: 'Stock non trouvé' });
    }

    await stock.destroy();
    res.json({ message: 'Stock supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du stock:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  getAllStocks,
  createStock,
  updateStock,
  deleteStock
}; 