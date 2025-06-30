import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Button, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import Navbar from '../navbar/Navbar';

const API_URL = process.env.REACT_APP_API_URL;

const DisponibiliteGestion = () => {
  const [disponibilites, setDisponibilites] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [allTechnicians, setAllTechnicians] = useState([]);
  const [form, setForm] = useState({ technician_id: '', start: '', end: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Charger techniciens et disponibilités
  useEffect(() => {
    const fetchAll = async () => {
      try {
        // On charge d'abord tous les techniciens (si aucune date n'est sélectionnée)
        const [techRes, dispoRes] = await Promise.all([
          axios.get(`${API_URL}/users/technicians`),
          axios.get(`${API_URL}/disponibilites`)
        ]);
        setTechnicians(techRes.data);
        setAllTechnicians(techRes.data);
        setDisponibilites(dispoRes.data);
      } catch (err) {
        setError("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Nouvelle fonction pour charger les techniciens disponibles à la date sélectionnée
  const fetchAvailableTechnicians = async (date) => {
    try {
      const res = await axios.get(`${API_URL}/users/technicians/available?date=${encodeURIComponent(date)}`);
      setTechnicians(res.data);
    } catch (err) {
      setError("Erreur lors du chargement des techniciens disponibles");
      setTechnicians([]);
    }
  };

  // Modification du handleChange pour le champ 'start'
  const handleChange = e => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'start') {
      setForm(f => ({ ...f, technician_id: '' })); // reset le technicien sélectionné
      if (value) {
        //fetchAvailableTechnicians(value);
      } else {
        // Si pas de date, on recharge tous les techniciens
        axios.get(`${API_URL}/users/technicians`).then(res => setTechnicians(res.data));
      }
    }
  };

  const handleAdd = async e => {
    e.preventDefault();
    setLoadingAdd(true);
    setError('');
    setSuccess('');
    try {
      await axios.post(`${API_URL}/disponibilites/add`, form);
      setSuccess('Disponibilité ajoutée !');
      setForm({ technician_id: '', start: '', end: '' });
      // Refresh
      const dispoRes = await axios.get(`${API_URL}/disponibilites`);
      setDisponibilites(dispoRes.data);
    } catch (err) {
      setError("Erreur lors de l'ajout de la disponibilité");
    } finally {
      setLoadingAdd(false);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Supprimer cette disponibilité ?')) return;
    try {
      await axios.delete(`${API_URL}/disponibilites/${id}`);
      setDisponibilites(disponibilites.filter(d => d.id !== id));
    } catch (err) {
      setError("Erreur lors de la suppression");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (loading) return <div className="text-center p-4"><Spinner animation="border" /></div>;

  return (
    <>
      {user && <Navbar user={user} onLogout={() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }} />}
      <div className="container py-4">
        <h3 className="mb-4">Gestion des disponibilités</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <Form onSubmit={handleAdd} className="mb-4">
          <Row className="g-2 align-items-end">
            <Col md={3}>
              <Form.Label>Technicien</Form.Label>
              <Form.Select name="technician_id" value={form.technician_id} onChange={handleChange} required>
                <option value="">Sélectionner un technicien</option>
                {technicians.map(tech => (
                  <option key={tech.id} value={tech.id}>{tech.first_name} {tech.last_name}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label>Début</Form.Label>
              <Form.Control
                type="datetime-local"
                name="start"
                value={form.start}
                onChange={handleChange}
                required
                step="3600"
              />
            </Col>
            <Col md={3}>
              <Form.Label>Fin</Form.Label>
              <Form.Control type="datetime-local" name="end" value={form.end} onChange={handleChange} required />
            </Col>
            <Col md={2}>
              <Button type="submit" variant="primary" className="w-100" disabled={loadingAdd}>Ajouter</Button>
            </Col>
          </Row>
        </Form>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Technicien</th>
              <th>Début</th>
              <th>Fin</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {disponibilites.map(dispo => {
              const tech = allTechnicians.find(t => t.id === dispo.technician_id);
              return (
                <tr key={dispo.id}>
                  <td>{tech ? tech.first_name + ' ' + tech.last_name : dispo.technician_id}</td>
                  <td>{new Date(dispo.start).toLocaleString('fr-FR')}</td>
                  <td>{new Date(dispo.end).toLocaleString('fr-FR')}</td>
                  <td>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(dispo.id)}>Supprimer</Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </>
  );
};

export default DisponibiliteGestion; 