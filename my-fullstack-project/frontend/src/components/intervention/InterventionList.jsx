import React, { useEffect, useState } from 'react';
import { Card, Spinner, Alert, Container, Form, Button, Row, Col, Pagination, Modal } from 'react-bootstrap';
import axios from 'axios';
import Navbar from '../navbar/Navbar';
import './InterventionList.css';
import { useNavigate, useLocation } from 'react-router-dom';
import CreateInterventionForm from '../CreateInterventionForm';

const InterventionList = () => {
  const [interventions, setInterventions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [returnToStock, setReturnToStock] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    dateStart: '',
    dateEnd: '',
    status: ''
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Récupérer l'utilisateur depuis le localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    const fetchInterventions = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/interventions');
        setInterventions(response.data);
        setFiltered(response.data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des interventions');
        setLoading(false);
      }
    };
    fetchInterventions();
  }, []);

  // Ajout : si on arrive avec une recherche depuis un feedback, préremplir et filtrer
  useEffect(() => {
    if (location.state?.search) {
      setFilters((prev) => ({ ...prev, search: location.state.search }));
      setTimeout(() => {
        const form = document.querySelector('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      }, 0);
    }
  }, [location.state]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleFilter = (e) => {
    e.preventDefault();
    setFiltered(interventions.filter(intervention => {
      const search = filters.search.toLowerCase();
      const matchSearch =
        search === '' ||
        (intervention.nom && intervention.nom.toLowerCase().includes(search)) ||
        (intervention.description && intervention.description.toLowerCase().includes(search));
      
      const interventionDate = new Date(intervention.scheduled_date);
      const startDate = filters.dateStart ? new Date(filters.dateStart) : null;
      const endDate = filters.dateEnd ? new Date(filters.dateEnd) : null;
      
      const matchDate = (!startDate || interventionDate >= startDate) && 
                       (!endDate || interventionDate <= endDate);
      
      const matchStatus = filters.status === '' || (intervention.status && intervention.status === filters.status);
      return matchSearch && matchDate && matchStatus;
    }));
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    // Recharger la liste des interventions
    const fetchInterventions = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/interventions');
        setInterventions(response.data);
        setFiltered(response.data);
      } catch (err) {
        setError('Erreur lors du chargement des interventions');
      }
    };
    fetchInterventions();
  };

  const handleDeleteClick = (intervention, e) => {
    e.stopPropagation(); // Empêche la navigation vers les détails
    setSelectedIntervention(intervention);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:3001/api/interventions/${selectedIntervention.id}`, {
        data: { returnToStock }
      });
      setInterventions(interventions.filter(i => i.id !== selectedIntervention.id));
      setFiltered(filtered.filter(i => i.id !== selectedIntervention.id));
      setShowDeleteModal(false);
      setSelectedIntervention(null);
      setReturnToStock(false);
    } catch (error) {
      setError('Erreur lors de la suppression de l\'intervention');
    }
  };

  // Calculer les éléments pour la page courante
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  // Gérer le changement de page
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Générer les numéros de page
  const pageNumbers = [];
  for (let number = 1; number <= totalPages; number++) {
    pageNumbers.push(number);
  }

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}><Spinner animation="border" /></div>;
  }
  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <>
      {user && <Navbar user={user} onLogout={() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }} />}
      <Container className="intervention-list-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Liste des interventions</h2>
        </div>
        <Form className="mb-4" onSubmit={handleFilter}>
          <Row className="g-2 align-items-end">
            <Col md={5}>
              <Form.Label>Recherche</Form.Label>
              <Form.Control
                type="text"
                name="search"
                value={filters.search}
                onChange={handleChange}
                placeholder="Nom ou description"
              />
            </Col>
            <Col md={3}>
              <Form.Label>Date de début</Form.Label>
              <Form.Control
                type="date"
                name="dateStart"
                value={filters.dateStart}
                onChange={handleChange}
              />
            </Col>
            <Col md={3}>
              <Form.Label>Date de fin</Form.Label>
              <Form.Control
                type="date"
                name="dateEnd"
                value={filters.dateEnd}
                onChange={handleChange}
              />
            </Col>
            <Col md={3}>
              <Form.Label>Statut</Form.Label>
              <Form.Select
                name="status"
                value={filters.status}
                onChange={handleChange}
              >
                <option value="">Tous</option>
                <option value="TERMINÉ">TERMINÉ</option>
                <option value="EN_COURS">EN_COURS</option>
                <option value="PLANIFIÉ">PLANIFIÉ</option>
              </Form.Select>
            </Col>
            <Col md={1} className="d-grid">
              <Button type="submit" variant="primary">Filtrer</Button>
            </Col>
          </Row>
        </Form>

        <Row className="mb-4">
          <Col className="d-flex justify-content-end">
            {user && user.role !== 'user' && (
              <Button 
                variant="primary" 
                onClick={() => setShowCreateModal(true)}
                className="d-flex align-items-center gap-2 btn-create-intervention"
              >
                <i className="bi bi-plus-circle"></i>
                Nouvelle intervention
              </Button>
            )}
          </Col>
        </Row>

        {currentItems.map(intervention => (
          <Card key={intervention.id} className="mb-3 intervention-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div onClick={() => navigate(`/interventions/${intervention.id}`, { state: { intervention } })} style={{ cursor: 'pointer', flex: 1 }}>
                  <Card.Title>Intervention #{intervention.id}</Card.Title>
                  <Card.Text>
                    <strong>Date :</strong> {new Date(intervention.scheduled_date).toLocaleDateString('fr-FR')}<br />
                    <strong>Description :</strong> {intervention.description}<br />
                    <strong>Statut :</strong> {intervention.status}
                  </Card.Text>
                </div>
                {user && user.role !== 'user' && (
                  <div className="d-flex justify-content-end" style={{ minWidth: 120 }}>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={(e) => handleDeleteClick(intervention, e)}
                    >
                      <i className="bi bi-trash"></i> Supprimer
                    </Button>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        ))}

        {/* Pagination */}
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            <Pagination.First 
              onClick={() => handlePageChange(1)} 
              disabled={currentPage === 1}
            />
            <Pagination.Prev 
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
            />
            
            {pageNumbers.map(number => (
              <Pagination.Item 
                key={number} 
                active={number === currentPage}
                onClick={() => handlePageChange(number)}
              >
                {number}
              </Pagination.Item>
            ))}
            
            <Pagination.Next 
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === totalPages}
            />
            <Pagination.Last 
              onClick={() => handlePageChange(totalPages)} 
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>

        <Modal show={showDeleteModal} onHide={() => {
          setShowDeleteModal(false);
          setSelectedIntervention(null);
          setReturnToStock(false);
        }}>
          <Modal.Header closeButton>
            <Modal.Title>Confirmer la suppression</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>Êtes-vous sûr de vouloir supprimer l'intervention #{selectedIntervention?.id} ?</p>
            <Form.Check 
              type="checkbox"
              label="Remettre les quantités utilisées dans le stock"
              checked={returnToStock}
              onChange={(e) => setReturnToStock(e.target.checked)}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => {
              setShowDeleteModal(false);
              setSelectedIntervention(null);
              setReturnToStock(false);
            }}>
              Annuler
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Supprimer
            </Button>
          </Modal.Footer>
        </Modal>

        <CreateInterventionForm
          visible={showCreateModal}
          onCancel={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      </Container>
    </>
  );
};

export default InterventionList; 