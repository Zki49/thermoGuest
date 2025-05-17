import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Form, Row, Col, InputGroup, Dropdown, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

const TVA_RATE = 0.21;

const EditInvoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [facture, setFacture] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [products, setProducts] = useState([]);
  const [tvaEnabled, setTvaEnabled] = useState(false);

  // Récupérer la facture et les clients
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [factureRes, clientsRes] = await Promise.all([
          axios.get(`http://localhost:3001/api/documents/${id}`),
          axios.get('http://localhost:3001/api/clients')
        ]);
        setFacture(factureRes.data);
        setClients(clientsRes.data);
        // Pour la démo, on simule des produits si non présents
        setProducts(factureRes.data.products || [
          { quantity: 1, description: '', unitPrice: 0 }
        ]);
        setSelectedClient(factureRes.data.client_id || '');
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement de la facture ou des clients');
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Calculs totaux
  const totalHT = products.reduce((sum, p) => sum + (Number(p.quantity) * Number(p.unitPrice)), 0);
  const tva = tvaEnabled ? totalHT * TVA_RATE : 0;
  const totalTTC = totalHT + tva;

  // Gestion des produits
  const handleProductChange = (idx, field, value) => {
    setProducts(products => products.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };
  const handleAddProduct = () => {
    setProducts([...products, { quantity: 1, description: '', unitPrice: 0 }]);
  };
  const handleRemoveProduct = (idx) => {
    setProducts(products => products.filter((_, i) => i !== idx));
  };

  // Gestion du client
  const handleClientChange = (e) => {
    setSelectedClient(e.target.value);
  };

  // Sauvegarde
  const handleSave = async () => {
    try {
      // À adapter selon le backend (ajouter la gestion des produits côté backend si besoin)
      await axios.put(`http://localhost:3001/api/documents/${id}`, {
        client_id: selectedClient,
        products,
        amount: totalHT,
        tva: tvaEnabled ? TVA_RATE : 0
      });
      navigate('/facturations');
    } catch (err) {
      setError('Erreur lors de la sauvegarde de la facture');
    }
  };

  // Suppression
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:3001/api/documents/${id}`);
      navigate('/facturations');
    } catch (err) {
      setError('Erreur lors de la suppression de la facture');
    }
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}><Spinner animation="border" /></div>;
  }
  if (error) {
    return <Alert variant="danger" className="m-4">{error}</Alert>;
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button variant="danger" onClick={handleDelete} className="me-2"><i className="bi bi-trash"></i> Supprimer</Button>
          <Button variant="success" onClick={handleSave}><i className="bi bi-save"></i> Sauvegarder</Button>
        </div>
        <h4>FACTURE-{id.toString().toUpperCase()}</h4>
      </div>
      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold">Résumé des Totaux</span>
                <Form.Check 
                  type="switch" 
                  id="tva-switch" 
                  label="TVA (21%)" 
                  checked={tvaEnabled} 
                  onChange={() => setTvaEnabled(v => !v)}
                />
              </div>
              <div>Total Hors Taxes : <span className="fw-bold">{totalHT.toFixed(2)} €</span></div>
              <div>TVA (21%) : <span className="fw-bold">{tva.toFixed(2)} €</span></div>
              <div className="mt-2">Total TTC : <span className="fw-bold">{totalTTC.toFixed(2)} €</span></div>
            </Card.Body>
          </Card>
          <Card className="mb-4">
            <Card.Body>
              <Form.Group>
                <Form.Label>Client</Form.Label>
                <Form.Select value={selectedClient} onChange={handleClientChange} required>
                  <option value="">Sélectionner un client</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.first_name} {client.last_name} ({client.email})</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card>
            <Card.Header className="bg-light fw-bold d-flex align-items-center justify-content-between">
              <span>Produits / Services</span>
              <Button variant="warning" size="sm" onClick={handleAddProduct}><i className="bi bi-plus"></i></Button>
            </Card.Header>
            <Card.Body>
              <Row className="mb-2 fw-bold text-center">
                <Col>QUANTITÉ</Col>
                <Col>DESCRIPTION</Col>
                <Col>PRIX UNITAIRE (HT)</Col>
                <Col>MONTANT (HT)</Col>
                <Col></Col>
              </Row>
              {products.map((prod, idx) => (
                <Row key={idx} className="align-items-center mb-2 text-center">
                  <Col>
                    <Form.Control type="number" min="1" value={prod.quantity} onChange={e => handleProductChange(idx, 'quantity', e.target.value)} />
                  </Col>
                  <Col>
                    <Form.Control type="text" value={prod.description} onChange={e => handleProductChange(idx, 'description', e.target.value)} />
                  </Col>
                  <Col>
                    <Form.Control type="number" min="0" step="0.01" value={prod.unitPrice} onChange={e => handleProductChange(idx, 'unitPrice', e.target.value)} />
                  </Col>
                  <Col className="fw-bold">
                    {(Number(prod.quantity) * Number(prod.unitPrice)).toFixed(2)} €
                  </Col>
                  <Col>
                    <Button variant="outline-danger" size="sm" onClick={() => handleRemoveProduct(idx)}><i className="bi bi-trash"></i></Button>
                  </Col>
                </Row>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EditInvoice; 