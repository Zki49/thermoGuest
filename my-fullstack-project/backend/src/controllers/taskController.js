const Task = require('../models/Task');

// Créer une nouvelle tâche
exports.createTask = async (req, res) => {
  try {
    const { description } = req.body;
    // L'ID de l'admin est 3 comme demandé
    const employee = 3;

    const newTask = await Task.create({
      employee,
      description,
      status: 'À_FAIRE',
      date_created: new Date(),
      date_updated: new Date(),
    });
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const { employee } = req.query;
    let where = {};
    if (employee) {
      where.employee = employee;
    }
    const tasks = await Task.findAll({ where, order: [['date_created', 'DESC']] });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 