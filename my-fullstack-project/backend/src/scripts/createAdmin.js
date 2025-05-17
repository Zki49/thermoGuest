require('dotenv').config();
const User = require('../models/User');
const bcrypt = require('bcrypt');

async function createAdmin() {
  try {
    console.log('Début de la création de l\'admin...');
    
    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ where: { email: 'admin@example.com' } });
    console.log('Admin existant:', existingAdmin ? {
      id: existingAdmin.id,
      email: existingAdmin.email,
      role: existingAdmin.role
    } : 'Non trouvé');

    if (existingAdmin) {
      console.log('L\'utilisateur admin existe déjà');
      process.exit(0);
    }

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash('admin123', 10);
    console.log('Mot de passe haché:', hashedPassword);

    // Créer l'utilisateur admin
    const admin = await User.create({
      email: 'admin@example.com',
      password: hashedPassword,
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin'
    });

    console.log('Utilisateur admin créé avec succès:', {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      password: admin.password
    });
    process.exit(0);
  } catch (error) {
    console.error('Erreur détaillée lors de la création de l\'admin:', error);
    process.exit(1);
  }
}

createAdmin(); 