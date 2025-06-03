import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Container, Alert, ListGroup, Spinner, Table } from 'react-bootstrap';
import FeedbackForm from '../feedback/FeedbackForm';

// Fonction utilitaire pour afficher les étoiles
const renderStars = (rating) => {
  return (
    <span>
      {[1,2,3,4,5].map((star) => (
        <span key={star} style={{ color: star <= rating ? '#ffd700' : '#ddd', fontSize: '1.2em' }}>★</span>
      ))}
    </span>
  );
};

const InterventionDetails = ({ intervention, user, stocks, loading, error, navigate, onAskQuote }) => {
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(true);
  const [feedbacksError, setFeedbacksError] = useState(null);

  // Charger les feedbacks à chaque affichage de la page
  useEffect(() => {
    const fetchFeedbacks = async () => {
      setFeedbacksLoading(true);
      setFeedbacksError(null);
      try {
        const res = await axios.get(`http://localhost:3001/api/feedbacks/intervention/${intervention.id}`);
        setFeedbacks(res.data);
      } catch (e) {
        setFeedbacks([]);
        setFeedbacksError("Erreur lors du chargement des feedbacks");
      }
      setFeedbacksLoading(false);
    };
    if (intervention && intervention.id) {
      fetchFeedbacks();
    }
  }, [intervention.id]);

  const handleFeedbackSubmitted = () => {
    setShowFeedbackForm(false);
    // Recharge les feedbacks depuis l'API
    axios.get(`http://localhost:3001/api/feedbacks/intervention/${intervention.id}`)
      .then(res => setFeedbacks(res.data));
  };

  if (!intervention) {
    return <Alert variant="danger" className="m-4">Aucune donnée d'intervention à afficher.</Alert>;
  }
  if (loading) {
    return <div className="d-flex justify-content-center align-items-center vh-100"><Spinner animation="border" /></div>;
  }
  if (error) {
    return <Alert variant="danger" className="m-4">{error}</Alert>;
  }

  return (
    <Container className="py-4">
      <i
        className="bi bi-arrow-left-circle-fill fs-2 text-secondary mb-3"
        style={{ cursor: 'pointer', display: 'block', width: 'fit-content' }}
        title="Retour"
        onClick={() => navigate(-1)}
      ></i>
      <Card>
        <Card.Header className="fw-bold">Détail de l'intervention #{intervention.id}</Card.Header>
        <Card.Body>
          <div><strong>Date :</strong> {intervention.scheduled_date ? new Date(intervention.scheduled_date).toLocaleDateString('fr-FR') : ''}</div>
          <div><strong>Description :</strong> {intervention.description}</div>
          <div><strong>Statut :</strong> {intervention.status}</div>
          <div><strong>Technicien :</strong> {user ? `${user.first_name} ${user.last_name}` : '...'}</div>
          <hr />
          <div><strong>Stocks utilisés :</strong></div>
          {stocks.length === 0 ? (
            <Alert variant="info">Aucun stock utilisé pour cette intervention.</Alert>
          ) : (
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>MATERIEL</th>
                  <th>QUANTITÉ</th>
                </tr>
              </thead>
              <tbody>
                {stocks.map((item) => (
                  <tr key={item.id}>
                    <td>{item.stock_name}</td>
                    <td>{item.quantity_used}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
          <hr />
          <div><strong>Feedbacks :</strong></div>
          {feedbacksLoading ? (
            <div className="mb-3"><Spinner animation="border" size="sm" /> Chargement des feedbacks...</div>
          ) : feedbacksError ? (
            <Alert variant="danger">{feedbacksError}</Alert>
          ) : (
            <ListGroup className="mb-3">
              {feedbacks.length === 0 && <ListGroup.Item>Aucun feedback.</ListGroup.Item>}
              {feedbacks.map((fb) => (
                <ListGroup.Item key={fb.id || Math.random()}>
                  <strong>{fb.client_name} :</strong> {fb.comment} {renderStars(fb.rating)}
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
          <div className="d-flex gap-2">
            <Button variant="primary" onClick={onAskQuote}>Demander la facture</Button>
            <Button 
              variant="success" 
              onClick={() => setShowFeedbackForm(!showFeedbackForm)}
            >
              {showFeedbackForm ? 'Annuler' : 'Laisser un feedback'}
            </Button>
          </div>
          {showFeedbackForm && (
            <div className="mt-4">
              <FeedbackForm 
                interventionId={intervention.id}
                clientId={user.id}
                onFeedbackSubmitted={handleFeedbackSubmitted}
              />
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default InterventionDetails; 