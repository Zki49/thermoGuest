import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Form, Row, Col, InputGroup, Dropdown, Spinner, Alert, Modal } from 'react-bootstrap';
import axios from 'axios';
import Navbar from '../components/navbar/Navbar';

const API_URL = process.env.REACT_APP_API_URL;

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
  const [status, setStatus] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [showStockModal, setShowStockModal] = useState(false);
  const [availableStocks, setAvailableStocks] = useState([]);
  const [selectedStockId, setSelectedStockId] = useState('');
  const [selectedStockQty, setSelectedStockQty] = useState(1);
  const [createdAt, setCreatedAt] = useState('');

  // Récupérer l'utilisateur depuis le localStorage
  const user = JSON.parse(localStorage.getItem('user'));
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Récupérer la facture et les clients
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [factureRes, clientsRes] = await Promise.all([
          axios.get(`${API_URL}/documents/${id}`),
          axios.get(`${API_URL}/users/clients`)
        ]);
        setFacture(factureRes.data);
        setClients(clientsRes.data);
        setSelectedClient(factureRes.data.user_id || '');
        setStatus(factureRes.data.status || '');
        setInvoiceDate(factureRes.data.invoice_date ? factureRes.data.invoice_date.substring(0, 10) : '');
        setDueDate(factureRes.data.due_date ? factureRes.data.due_date.substring(0, 10) : '');
        setCreatedAt(factureRes.data.created_at ? factureRes.data.created_at.substring(0, 10) : '');
        // Récupérer les produits du stock utilisés pour l'intervention
        let stockProducts = [];
        if (factureRes.data.intervention_id) {
          const stocksRes = await axios.get(`${API_URL}/intervention-stocks/${factureRes.data.intervention_id}`);
          stockProducts = stocksRes.data.map(item => ({
            quantity: item.quantity_used,
            description: item.stock_name,
            unitPrice: item.unit_price !== undefined ? Number(item.unit_price) : 0,
            stock_id: item.stock_id // On conserve le stock_id pour la sauvegarde
          }));
        }
        // Fusionner avec les produits déjà présents (éviter doublons)
        const existingProducts = (factureRes.data.products || []).map(p => ({
          ...p,
          unitPrice: p.unitPrice !== undefined ? p.unitPrice : (p.unit_price !== undefined ? p.unit_price : 0)
        }));
        const mergedProducts = [...stockProducts, ...existingProducts.filter(p => !stockProducts.some(sp => sp.description === p.description))];
        setProducts(mergedProducts.length > 0 ? mergedProducts : [{ quantity: 1, description: '', unitPrice: 0 }]);
        setTvaEnabled(!!factureRes.data.with_tva);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement de la facture ou des clients');
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Calculs totaux
  console.log('products:', products);
  const totalHT = products.reduce((sum, p) => sum + (Number(p.quantity) * Number(p.unitPrice)), 0);
  const tva = tvaEnabled ? totalHT * TVA_RATE : 0;
  const totalTTC = totalHT + tva;

  // Gestion des produits
  const handleProductChange = (idx, field, value) => {
    setProducts(products => products.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };
  const handleAddProduct = () => {
    setShowStockModal(true);
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
    if (!selectedClient) {
      setError('Veuillez sélectionner un client.');
      return;
    }
    try {
      const productsToSend = products
        .filter(p => p.stock_id)
        .map(p => ({
          stock_id: p.stock_id,
          quantity: p.quantity
        }));
      await axios.put(`${API_URL}/documents/${id}`, {
        client_id: parseInt(selectedClient),
        products: productsToSend,
        amount: totalTTC,
        tva: tvaEnabled ? TVA_RATE : 0,
        status,
        invoice_date: invoiceDate,
        due_date: dueDate,
        created_at: createdAt,
        with_tva: tvaEnabled
      });
      navigate('/facturations');
    } catch (err) {
      setError('Erreur lors de la sauvegarde de la facture');
    }
  };

  // Suppression
  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/documents/${id}`);
      navigate('/facturations');
    } catch (err) {
      setError('Erreur lors de la suppression de la facture');
    }
  };

  const handleConfirmAddStock = () => {
    const stock = availableStocks.find(s => s.id === Number(selectedStockId));
    if (stock && selectedStockQty > 0 && selectedStockQty <= stock.quantity) {
      setProducts([...products, {
        quantity: selectedStockQty,
        description: stock.name,
        unitPrice: stock.unit_price ? Number(stock.unit_price) : 0,
        stock_id: stock.id
      }]);
      setShowStockModal(false);
      setSelectedStockId('');
      setSelectedStockQty(1);
    }
  };

  useEffect(() => {
    if (showStockModal) {
      axios.get(`${API_URL}/stocks`)
        .then(res => setAvailableStocks(res.data))
        .catch(() => setAvailableStocks([]));
    }
  }, [showStockModal]);

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}><Spinner animation="border" /></div>;
  }
  if (error) {
    return <Alert variant="danger" className="m-4">{error}</Alert>;
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="container py-4">
        <i
          className="bi bi-arrow-left-circle-fill fs-2 text-secondary mb-3"
          style={{ cursor: 'pointer', display: 'block', width: 'fit-content' }}
          title="Retour aux factures"
          onClick={() => navigate('/facturations')}
        ></i>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Form.Select style={{ display: 'inline-block', width: 180, verticalAlign: 'middle' }} value={status} onChange={e => setStatus(e.target.value)}>
              <option value="EN_ATTENTE">En attente</option>
              <option value="PAYÉ">Payée</option>
              <option value="ANNULÉ">Annulée</option>
              <option value="BROUILLON">Brouillon</option>
              <option value="IMPAYÉE">Impayée</option>
            </Form.Select>
          </div>
          <div className="text-center flex-grow-1">
            <h4 className="mb-0">
              {facture && facture.Intervention && facture.Intervention.description
                ? facture.Intervention.description
                : `FACTURE-${id.toString().toUpperCase()}`}
            </h4>
          </div>
          <div>
            <i
              className="bi bi-floppy fs-3 text-success me-3"
              style={{ cursor: 'pointer' }}
              title="Sauvegarder"
              onClick={handleSave}
            ></i>
            <i
              className="bi bi-trash3 fs-3 text-danger"
              style={{ cursor: 'pointer' }}
              title="Supprimer"
              onClick={handleDelete}
            ></i>
          </div>
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
                <Form.Group className="mt-3">
                  <Form.Label>Date de la facture</Form.Label>
                  <Form.Control type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                </Form.Group>
                <Form.Group className="mt-3">
                  <Form.Label>Date d'échéance</Form.Label>
                  <Form.Control type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
          <Col md={8}>
            <Card>
              <Card.Header className="bg-light fw-bold d-flex align-items-center justify-content-between">
                <span>Produits / Services</span>
                <span
                  onClick={handleAddProduct}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: '#ffc107',
                    color: '#212529',
                    fontSize: 28,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                  }}
                  title="Ajouter un produit ou service"
                >
                  <i className="bi bi-plus"></i>
                </span>
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
                    <Col className="fw-bold" style={{ lineHeight: '38px' }}>
                      {prod.unitPrice !== undefined ? Number(prod.unitPrice).toFixed(2) : '-'} €
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
        <Modal show={showStockModal} onHide={() => setShowStockModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Ajouter un élément du stock</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Élément du stock</Form.Label>
              <Form.Select value={selectedStockId} onChange={e => setSelectedStockId(e.target.value)} required>
                <option value="">Sélectionner un élément</option>
                {availableStocks.map(stock => (
                  <option key={stock.id} value={stock.id}>{stock.name} (dispo: {stock.quantity})</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quantité</Form.Label>
              <Form.Control type="number" min="1" max={selectedStockId ? (availableStocks.find(s => s.id === Number(selectedStockId))?.quantity || 1) : 1} value={selectedStockQty} onChange={e => setSelectedStockQty(Number(e.target.value))} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Prix unitaire (HT)</Form.Label>
              <Form.Control type="text" value={selectedStockId ? (availableStocks.find(s => s.id === Number(selectedStockId))?.unit_price ?? '-') : '-'} readOnly />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowStockModal(false)}>Annuler</Button>
            <Button variant="primary" onClick={handleConfirmAddStock} disabled={!selectedStockId || selectedStockQty < 1}>Ajouter</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default EditInvoice; 