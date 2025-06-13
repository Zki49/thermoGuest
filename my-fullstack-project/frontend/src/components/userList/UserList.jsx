import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      console.log('Début de la récupération des utilisateurs...');
      try {
        const response = await axios.get(`${API_URL}/users`);
        console.log('Réponse reçue:', response.data);
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération:', err);
        setError('Erreur lors du chargement des utilisateurs: ' + err.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  console.log('État actuel:', { users, loading, error });

  if (loading) return <div className="p-4">Chargement en cours...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (users.length === 0) return <div className="p-4">Aucun utilisateur trouvé</div>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Liste des Utilisateurs</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border">ID</th>
              <th className="py-2 px-4 border">Nom</th>
              <th className="py-2 px-4 border">Prénom</th>
              <th className="py-2 px-4 border">Email</th>
              <th className="py-2 px-4 border">Rôle</th>
              <th className="py-2 px-4 border">Date de création</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="py-2 px-4 border">{user.id}</td>
                <td className="py-2 px-4 border">{user.last_name}</td>
                <td className="py-2 px-4 border">{user.first_name}</td>
                <td className="py-2 px-4 border">{user.email}</td>
                <td className="py-2 px-4 border">{user.role}</td>
                <td className="py-2 px-4 border">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList; 