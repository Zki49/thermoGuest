import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Row, Col, Modal, Form } from 'react-bootstrap';
import axios from 'axios';
import Navbar from '../navbar/Navbar';
import './Facturation.css';
import { useNavigate } from 'react-router-dom';

const statusLabels = {
  'PAYÉ': { label: 'Payée', color: 'success', icon: 'bi bi-check-circle' },
  'EN_ATTENTE': { label: 'En attente', color: 'warning', icon: 'bi bi-clock' },
  'ANNULÉ': { label: 'Annulée', color: 'primary', icon: 'bi bi-x-circle' },
  'BROUILLON': { label: 'Brouillon', color: 'light', icon: 'bi bi-file-earmark' },
  'IMPAYÉE': { label: 'Impayée', color: 'danger', icon: 'bi bi-x-circle' }
};

const Facturation = () => {
  const [factures, setFactures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    intervention_id: ''
  });
  const [interventions, setInterventions] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    fetchDocuments();
    fetchInterventions();
  }, []);

  const fetchInterventions = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/interventions');
      setInterventions(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des interventions:', err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/documents');
      const documents = response.data;
      setFactures(documents.filter(doc => doc.type === 'FACTURE'));
      setLoading(false);
    } catch (err) {
      setError('Erreur lors du chargement des documents');
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setFormData({
      intervention_id: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Récupérer l'intervention sélectionnée
      const selectedIntervention = interventions.find(i => i.id === parseInt(formData.intervention_id));
      
      if (!selectedIntervention) {
        throw new Error('Intervention non trouvée');
      }

      const response = await axios.post('http://localhost:3001/api/documents', {
        intervention_id: selectedIntervention.id,
        type: 'FACTURE',
        amount: selectedIntervention.amount || 0,
        description: `Facture pour l'intervention #${selectedIntervention.id} - ${selectedIntervention.description || 'Sans description'}`
      });
      
      setFactures([...factures, response.data]);
      handleCloseModal();
    } catch (err) {
      console.error('Erreur lors de la création de la facture:', err);
      setError('Erreur lors de la création de la facture');
    }
  };

  const getStatusProps = (status) => {
    return statusLabels[status] || { label: status, color: 'secondary', icon: 'bi bi-question-circle' };
  };

  const handleEditClick = (facture) => {
    navigate(`/editInvoice/${facture.id}`);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
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
    <>
      {user && <Navbar user={user} onLogout={() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }} />}
      <div className="container py-4">
        <h3 className="mb-4">Mes factures</h3>
        <Row className="g-4">
          {/* Carte pour créer une facture */}
          <Col xs={12} md={6} lg={4} xl={3}>
            <Card className="facture-card create-card h-100 d-flex align-items-center justify-content-center text-center">
              <Card.Body>
                <Button variant="link" className="p-0 text-decoration-none" style={{ color: '#f59e0b' }} onClick={handleCreateClick}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}><i className="bi bi-layers"></i></div>
                  <div style={{ fontWeight: 600, fontSize: 20 }}>Créer une facture</div>
                </Button>
              </Card.Body>
            </Card>
          </Col>
          {/* Affichage des factures */}
          {factures.map((facture) => {
            const status = getStatusProps(facture.status);
            return (
              <Col key={facture.id} xs={12} md={6} lg={4} xl={3}>
                <Card className="facture-card h-100" onClick={() => handleEditClick(facture)} style={{ cursor: 'pointer' }}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Badge bg={status.color} className="facture-badge"><i className={status.icon}></i> {status.label}</Badge>
                      <Button
                        variant="warning"
                        size="sm"
                        className="facture-plus-btn"
                        onClick={e => { e.stopPropagation(); window.open(`http://localhost:3001/api/documents/${facture.id}/pdf`, '_blank'); }}
                      >
                        Plus <i className="bi bi-box-arrow-up-right"></i>
                      </Button>
                    </div>
                    <div className="facture-num text-muted mb-1" style={{ fontSize: 14 }}>FACT-{facture.id.toString(16).toUpperCase()}</div>
                    <div className="facture-montant mb-1" style={{ fontWeight: 700, fontSize: 32 }}>{Number(facture.amount).toFixed(2)} €</div>
                    <div className="facture-desc text-muted" style={{ fontSize: 15 }}>{facture.description || 'Aucune description'}</div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </div>

      {/* Modal de création de facture */}
      <Modal show={showCreateModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Créer une nouvelle facture</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Intervention</Form.Label>
              <Form.Select
                name="intervention_id"
                value={formData.intervention_id}
                onChange={handleInputChange}
                required
              >
                <option value="">Sélectionner une intervention</option>
                {interventions.map(intervention => (
                  <option key={intervention.id} value={intervention.id}>
                    Intervention #{intervention.id} - {new Date(intervention.scheduled_date).toLocaleDateString()}
                    {intervention.description ? ` - ${intervention.description}` : ''}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleCloseModal}>
                Annuler
              </Button>
              <Button variant="primary" type="submit">
                Créer la facture
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Facturation; 