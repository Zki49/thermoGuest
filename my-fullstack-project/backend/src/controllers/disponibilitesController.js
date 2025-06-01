const Disponibilite = require('../models/disponibilite');

// Récupérer les disponibilités (avec filtre optionnel par technicien)
exports.getAll = async (req, res) => {
  try {
    const { technician_id } = req.query;
    const where = technician_id ? { technician_id } : {};
    const dispos = await Disponibilite.findAll({ where });
    res.json(dispos);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des disponibilités' });
  }
};

// Créer une disponibilité
exports.create = async (req, res) => {
  try {
    const { technician_id, start, end } = req.body;
    const dispo = await Disponibilite.create({ technician_id, start, end });
    res.status(201).json(dispo);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de l'ajout de la disponibilité" });
  }
};

// Supprimer une disponibilité
exports.remove = async (req, res) => {
  try {
    await Disponibilite.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la suppression de la disponibilité" });
  }
};

// Modifier une disponibilité
exports.update = async (req, res) => {
  try {
    const { start, end } = req.body;
    const dispo = await Disponibilite.findByPk(req.params.id);
    if (!dispo) return res.status(404).json({ error: 'Disponibilité non trouvée' });
    dispo.start = start;
    dispo.end = end;
    await dispo.save();
    res.json(dispo);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la modification de la disponibilité" });
  }
}; 