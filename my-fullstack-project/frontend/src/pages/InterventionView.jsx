import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Card, Button, Container, Alert, ListGroup, Spinner, Table } from 'react-bootstrap';
import axios from 'axios';

const InterventionView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const intervention = state?.intervention;

  const [user, setUser] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!intervention) return;
      setLoading(true);
      try {
        // Récupérer l'utilisateur lié à l'intervention
        const userRes = await axios.get(`http://localhost:3001/api/users/${intervention.user_id}`);
        setUser(userRes.data);
        // Récupérer les stocks utilisés pour cette intervention
        const stocksRes = await axios.get(`http://localhost:3001/api/intervention-stocks/${intervention.id}`);
        setStocks(stocksRes.data);
        // Récupérer les feedbacks liés à cette intervention
        const feedbacksRes = await axios.get(`http://localhost:3001/api/feedbacks/intervention/${intervention.id}`);
        setFeedbacks(feedbacksRes.data);
      } catch (err) {
        setError("Erreur lors du chargement des détails de l'intervention");
      }
      setLoading(false);
    };
    fetchDetails();
  }, [intervention]);

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
      <Button variant="secondary" className="mb-3" onClick={() => navigate(-1)}>
        &larr; Retour
      </Button>
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
          <ListGroup className="mb-3">
            {feedbacks.length === 0 && <ListGroup.Item>Aucun feedback.</ListGroup.Item>}
            {feedbacks.map((fb) => (
              <ListGroup.Item key={fb.id}>
                <strong>{fb.client_name} :</strong> {fb.comment} (Note : {fb.rating}/5)
              </ListGroup.Item>
            ))}
          </ListGroup>
          <Button variant="primary" className="me-2">Demander un devis</Button>
          <Button variant="success">Laisser un feedback</Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default InterventionView; 