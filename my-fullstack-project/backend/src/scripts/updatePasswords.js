require('dotenv').config();
const { User } = require('../models');
const bcrypt = require('bcrypt');

async function updatePasswords() {
  try {
    // Récupérer tous les utilisateurs
    const users = await User.findAll();
    
    for (const user of users) {
      // Vérifier si le mot de passe est déjà haché
      if (!user.password.startsWith('$2')) {
        // Hacher le mot de passe
        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        // Mettre à jour l'utilisateur
        await user.update({ password: hashedPassword });
        console.log(`Mot de passe mis à jour pour l'utilisateur: ${user.email}`);
      }
    }
    
    console.log('Mise à jour des mots de passe terminée');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des mots de passe:', error);
    process.exit(1);
  }
}

updatePasswords(); 