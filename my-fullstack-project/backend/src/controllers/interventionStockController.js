const InterventionStock = require('../models/InterventionStock');
const Stock = require('../models/Stock');

const getInterventionStocks = async (req, res) => {
  try {
    const { interventionId } = req.params;
    const interventionStocks = await InterventionStock.findAll({
      where: { intervention_id: interventionId },
      include: [
        {
          model: Stock,
          as: 'stock',
          attributes: ['name', 'unit_price']
        }
      ]
    });

    // Mapper pour inclure le nom et le prix unitaire du stock directement
    const formattedStocks = interventionStocks.map(item => ({
      id: item.id,
      intervention_id: item.intervention_id,
      stock_id: item.stock_id,
      quantity_used: item.quantity_used,
      stock_name: item.stock ? item.stock.name : 'Stock inconnu',
      unit_price: item.stock ? item.stock.unit_price : 0
    }));

    res.json(formattedStocks);
  } catch (error) {
    console.error('Erreur lors de la récupération des stocks pour l\'intervention:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

module.exports = {
  getInterventionStocks
}; 