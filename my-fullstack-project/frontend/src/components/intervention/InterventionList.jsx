import React, { useEffect, useState } from 'react';
import { Card, Spinner, Alert, Container, Form, Button, Row, Col, Pagination } from 'react-bootstrap';
import axios from 'axios';
import Navbar from '../navbar/Navbar';
import './InterventionList.css';
import { useNavigate } from 'react-router-dom';

const InterventionList = () => {
  const [interventions, setInterventions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    search: '',
    dateStart: '',
    dateEnd: '',
    status: ''
  });
  const navigate = useNavigate();

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
        <h2 className="mb-4">Toutes les interventions</h2>
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
        {currentItems.map(intervention => (
          <Card key={intervention.id} className="mb-3 intervention-card" onClick={() => navigate(`/interventions/${intervention.id}`, { state: { intervention } })} style={{ cursor: 'pointer' }}>
            <Card.Body>
              <Card.Title>Intervention #{intervention.id}</Card.Title>
              <Card.Text>
                <strong>Date :</strong> {new Date(intervention.scheduled_date).toLocaleDateString('fr-FR')}<br />
                <strong>Description :</strong> {intervention.description}<br />
                <strong>Statut :</strong> {intervention.status}
              </Card.Text>
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
      </Container>
    </>
  );
};

export default InterventionList; 