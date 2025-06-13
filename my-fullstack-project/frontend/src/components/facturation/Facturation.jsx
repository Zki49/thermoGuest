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

const API_URL = process.env.REACT_APP_API_URL;

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
  const [filter, setFilter] = useState({
    ref: '',
    date: '',
    status: ''
  });
  const [userSearch, setUserSearch] = useState('');

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
      const response = await axios.get(`${API_URL}/interventions`);
      setInterventions(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des interventions:', err);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`${API_URL}/documents`);
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

      const response = await axios.post(`${API_URL}/documents`, {
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

  const filteredFactures = factures.filter(facture => {
    // Filtre référence
    const matchRef = !filter.ref || facture.id.toString() === filter.ref;
    // Filtre date
    const factureDateObj = new Date(facture.created_at);
    const factureDateISO = factureDateObj.toISOString().slice(0, 10); // format YYYY-MM-DD
    const matchDate = filter.date === '' || factureDateISO === filter.date;
    // Filtre statut
    const matchStatus = filter.status === '' || facture.status === filter.status;
    // Filtre utilisateur
    const user = facture.User;
    const search = userSearch.toLowerCase();
    const matchUser =
      userSearch === '' ||
      (user &&
        (
          (user.first_name && user.first_name.toLowerCase().includes(search)) ||
          (user.last_name && user.last_name.toLowerCase().includes(search)) ||
          (user.email && user.email.toLowerCase().includes(search))
        )
      );
    return matchRef && matchDate && matchStatus && matchUser;
  });

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
        {/* Filtres */}
        <Form className="mb-4">
          <Row className="g-2 align-items-end">
            <Col md={3}>
              <Form.Label>Utilisateur</Form.Label>
              <Form.Control
                type="text"
                placeholder="Rechercher par nom, prénom ou email..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Label>Référence</Form.Label>
              <Form.Control
                type="number"
                placeholder="Rechercher par référence..."
                value={filter.ref || ''}
                onChange={e => setFilter(f => ({ ...f, ref: e.target.value }))}
              />
            </Col>
            <Col md={3}>
              <Form.Label>Date</Form.Label>
              <Form.Control
                type="date"
                value={filter.date}
                onChange={e => setFilter(f => ({ ...f, date: e.target.value }))}
              />
            </Col>
            <Col md={2}>
              <Form.Label>Statut</Form.Label>
              <Form.Select
                value={filter.status}
                onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
              >
                <option value="">Tous</option>
                {Object.keys(statusLabels).map(key => (
                  <option key={key} value={key}>{statusLabels[key].label}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button variant="outline-secondary" className="w-100" onClick={() => { setFilter({ ref: '', date: '', status: '' }); setUserSearch(''); }}>
                Réinitialiser
              </Button>
            </Col>
          </Row>
        </Form>
        <Row className="g-4">
          {/* Carte pour créer une facture */}
          {user && user.role !== 'user' && (
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
          )}
          {/* Affichage des factures */}
          {filteredFactures.map((facture) => {
            const status = getStatusProps(facture.status);
            return (
              <Col key={facture.id} xs={12} md={6} lg={4} xl={3}>
                <Card
                  className="facture-card h-100"
                  onClick={user && user.role !== 'user' ? () => handleEditClick(facture) : undefined}
                  style={{ cursor: user && user.role !== 'user' ? 'pointer' : 'default' }}
                >
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Badge bg={status.color} className="facture-badge"><i className={status.icon}></i> {status.label}</Badge>
                      <span className="ms-auto" style={{ cursor: 'pointer' }}
                        onClick={e => { e.stopPropagation(); window.open(`http://localhost:3001/api/documents/${facture.id}/pdf`, '_blank'); }}
                      >
                        <i className="bi bi-filetype-pdf" style={{ fontSize: 24, color: '#d32f2f' }}></i>
                      </span>
                    </div>
                    <div className="facture-ref text-muted mb-1" style={{ fontSize: 14 }}>Ref: {facture.id}</div>
                    <div className="facture-montant mb-1" style={{ fontWeight: 700, fontSize: 32 }}>{Number(facture.amount).toFixed(2)} €</div>
                    <p>
                        {facture.Intervention?.description || "Aucune description"}
                    </p>
                    
                  </Card.Body>
                  <p>
                      {new Date(facture.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
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