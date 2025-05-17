import React from 'react';
import { Card, Button, Container, Alert, ListGroup, Spinner, Table } from 'react-bootstrap';

const InterventionDetails = ({ intervention, user, stocks, feedbacks, loading, error, navigate, onAskQuote, onFeedback }) => {
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
          <Button variant="primary" className="me-2" onClick={onAskQuote}>Demander un devis</Button>
          <Button variant="success" onClick={onFeedback}>Laisser un feedback</Button>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default InterventionDetails; 