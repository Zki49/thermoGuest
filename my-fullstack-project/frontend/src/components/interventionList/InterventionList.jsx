import React, { useState, useEffect } from 'react';
import { Card, Table, Badge } from 'react-bootstrap';
import axios from 'axios';

const InterventionList = ({ userId }) => {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/interventions?user_id=${userId}`);
        setInterventions(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des interventions:', err);
        setError('Erreur lors du chargement des interventions');
        setLoading(false);
      }
    };

    if (userId) {
      fetchInterventions();
    }
  }, [userId]);

  const getStatusBadge = (status) => {
    const variants = {
      'PLANIFIÉ': 'warning',
      'EN_COURS': 'primary',
      'TERMINÉ': 'success'
    };
    return <Badge bg={variants[status]}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4" role="alert">
        {error}
      </div>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-white">
        <h5 className="mb-0">Liste des Interventions</h5>
      </Card.Header>
      <Card.Body>
        <Table responsive hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Date prévue</th>
              <th>Statut</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {interventions.map((intervention) => (
              <tr key={intervention.id}>
                <td>{intervention.id}</td>
                <td>{new Date(intervention.scheduled_date).toLocaleDateString()}</td>
                <td>{getStatusBadge(intervention.status)}</td>
                <td>{intervention.description}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default InterventionList; 