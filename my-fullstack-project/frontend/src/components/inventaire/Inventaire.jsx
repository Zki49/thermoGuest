import React, { useState, useEffect, useCallback } from 'react';
import { Table, Card, Spinner, Button, Modal, Form, Pagination, InputGroup } from 'react-bootstrap';
import axios from 'axios';
import Navbar from '../navbar/Navbar';

const API_URL = process.env.REACT_APP_API_URL;

const Inventaire = () => {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    quantity_min: '',
    unit_price: ''
  });
  const [showLowStock, setShowLowStock] = useState(false);

  // Fonction de debounce pour le terme de recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // Délai de 300ms

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  useEffect(() => {
    // Récupérer l'utilisateur depuis le localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    const fetchStocks = async () => {
      try {
        const response = await axios.get(`${API_URL}/stocks`);
        setStocks(response.data);
        setFilteredStocks(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération du stock:', err);
        setError('Erreur lors du chargement de l\'inventaire');
        setLoading(false);
      }
    };
    fetchStocks();
  }, []);

  // Filtrer les stocks avec le terme de recherche debounced
  useEffect(() => {
    const filtered = stocks.filter(stock => {
      const searchLower = debouncedSearchTerm.toLowerCase();
      return (
        stock.name.toLowerCase().includes(searchLower) ||
        stock.description.toLowerCase().includes(searchLower)
      );
    });
    setFilteredStocks(filtered);
    setCurrentPage(1); // Réinitialiser la page courante lors du filtrage
  }, [debouncedSearchTerm, stocks]);

  // Calcul des stocks à afficher selon le filtre low stock
  const displayedStocks = showLowStock
    ? filteredStocks.filter(stock => Number(stock.quantity) < Number(stock.quantity_min))
    : filteredStocks;

  // Calculer les éléments pour la page courante
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayedStocks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(displayedStocks.length / itemsPerPage);

  // Gérer le changement de page
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Générer les numéros de page
  const pageNumbers = [];
  for (let number = 1; number <= totalPages; number++) {
    pageNumbers.push(number);
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleEdit = (stock) => {
    setSelectedStock(stock);
    setFormData({
      name: stock.name,
      description: stock.description,
      quantity: stock.quantity,
      quantity_min: stock.quantity_min,
      unit_price: stock.unit_price || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = (stock) => {
    setSelectedStock(stock);
    setShowDeleteModal(true);
  };

  const handleCreate = () => {
    setFormData({
      name: '',
      description: '',
      quantity: '',
      quantity_min: '',
      unit_price: ''
    });
    setShowCreateModal(true);
  };

  const handleClose = () => {
    setShowEditModal(false);
    setShowCreateModal(false);
    setShowDeleteModal(false);
    setSelectedStock(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedStock) {
        // Mise à jour
        const response = await axios.put(`${API_URL}/stocks/${selectedStock.id}`, formData);
        setStocks(stocks.map(stock => 
          stock.id === selectedStock.id ? response.data : stock
        ));
      } else {
        // Création
        const response = await axios.post(`${API_URL}/stocks`, formData);
        setStocks([...stocks, response.data]);
      }
      handleClose();
    } catch (err) {
      console.error('Erreur lors de la mise à jour/création du stock:', err);
      setError('Erreur lors de l\'opération');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${API_URL}/stocks/${selectedStock.id}`);
      setStocks(stocks.filter(stock => stock.id !== selectedStock.id));
      handleClose();
    } catch (err) {
      console.error('Erreur lors de la suppression du stock:', err);
      setError('Erreur lors de la suppression de l\'élément');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Chargement...</span>
        </Spinner>
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
      {user && <Navbar user={user} onLogout={handleLogout} />}
      <div className="container-fluid p-4">
        <Card>
          <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
            <h2 className="mb-0">Inventaire</h2>
            <i 
              className="bi bi-plus-circle-fill fs-2 text-light" 
              style={{ cursor: 'pointer' }} 
              title="Nouvel élément"
              onClick={handleCreate}
            ></i>
          </Card.Header>
          <Card.Body>
            <InputGroup className="mb-4">
              <InputGroup.Text>
                <i className="bi bi-search"></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Rechercher par nom ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <Form.Check
              type="switch"
              id="low-stock-switch"
              label="Afficher uniquement les articles sous le stock minimal"
              className="mb-3"
              checked={showLowStock}
              onChange={() => setShowLowStock(v => !v)}
            />

            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Description</th>
                  <th>Quantité</th>
                  <th>Quantité min</th>
                  <th>Prix unitaire (€)</th>
                  <th>Dernière mise à jour</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((stock) => (
                  <tr key={stock.id}>
                    <td>{stock.name}</td>
                    <td>{stock.description}</td>
                    <td>{stock.quantity}</td>
                    <td>{stock.quantity_min}</td>
                    <td>{stock.unit_price ? Number(stock.unit_price).toFixed(2) : '-'}</td>
                    <td>{new Date(stock.updated_at).toLocaleDateString()}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleEdit(stock)}
                        >
                          <i className="bi bi-pencil"></i> Modifier
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDelete(stock)}
                        >
                          <i className="bi bi-trash"></i> Supprimer
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            
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
          </Card.Body>
        </Card>
      </div>

      {/* Modal d'édition */}
      <Modal show={showEditModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Modifier l'élément</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Quantité</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Quantité minimale</Form.Label>
              <Form.Control
                type="number"
                name="quantity_min"
                value={formData.quantity_min}
                onChange={handleChange}
                required
                min="0"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Prix unitaire (€)</Form.Label>
              <Form.Control
                type="number"
                name="unit_price"
                value={formData.unit_price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleClose}>
                Annuler
              </Button>
              <Button variant="primary" type="submit">
                Enregistrer
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal de création */}
      <Modal show={showCreateModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Nouvel élément</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Quantité</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                required
                min="0"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Quantité minimale</Form.Label>
              <Form.Control
                type="number"
                name="quantity_min"
                value={formData.quantity_min}
                onChange={handleChange}
                required
                min="0"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Prix unitaire (€)</Form.Label>
              <Form.Control
                type="number"
                name="unit_price"
                value={formData.unit_price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={handleClose}>
                Annuler
              </Button>
              <Button variant="primary" type="submit">
                Créer
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal de confirmation de suppression */}
      <Modal show={showDeleteModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir supprimer l'élément "{selectedStock?.name}" ?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Inventaire; 