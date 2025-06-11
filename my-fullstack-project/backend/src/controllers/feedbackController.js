const Feedback = require('../models/Feedback');
const User = require('../models/User');

// Récupérer tous les feedbacks avec le nom du client
exports.getAllFeedbacks = async (req, res) => {
  console.log(req.user);
  try {
    let where = {};
    if (req.user && req.user.role === 'user') {
      where.client_id = req.user.id;
    }
    const feedbacks = await Feedback.findAll({
      where,
      include: [{
        model: User,
        as: 'client',
        attributes: ['first_name', 'last_name']
      }],
      order: [['id', 'ASC']]
    });
    res.json(feedbacks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des feedbacks' });
  }
};

// Récupérer les feedbacks par ID d'intervention avec le nom du client
exports.getFeedbacksByInterventionId = async (req, res) => {
  try {
    const { interventionId } = req.params;
    const feedbacks = await Feedback.findAll({
      where: { intervention_id: interventionId },
      include: [{
        model: User,
        as: 'client',
        attributes: ['first_name', 'last_name']
      }],
      order: [['id', 'ASC']]
    });

    // Mapper pour inclure le nom complet du client
    const formattedFeedbacks = feedbacks.map(fb => ({
      id: fb.id,
      intervention_id: fb.intervention_id,
      client_id: fb.client_id,
      comment: fb.comment,
      rating: fb.rating,
      client_name: fb.client ? `${fb.client.first_name} ${fb.client.last_name}` : 'Client inconnu'
    }));

    res.json(formattedFeedbacks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la récupération des feedbacks pour l\'intervention' });
  }
};

// Créer un nouveau feedback
exports.createFeedback = async (req, res) => {
  try {
    const { intervention_id, client_id, comment, rating } = req.body;

    // Validation des données
    if (!intervention_id || !client_id || !rating) {
      return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'La note doit être comprise entre 1 et 5' });
    }

    const feedback = await Feedback.create({
      intervention_id,
      client_id,
      comment,
      rating,
      created_at: new Date(),
      updated_at: new Date()
    });

    res.status(201).json(feedback);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la création du feedback' });
  }
}; 