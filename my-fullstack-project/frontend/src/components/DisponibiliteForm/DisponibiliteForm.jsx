import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';

const DisponibiliteForm = () => {
  const [technicians, setTechnicians] = useState([]);
  const [form, setForm] = useState({
    technician_id: '',
    start: '',
    end: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Charger la liste des techniciens
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/users/technicians');
        setTechnicians(res.data);
      } catch (err) {
        setError("Erreur lors du chargement des techniciens");
      } finally {
        setLoading(false);
      }
    };
    fetchTechnicians();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSuccess('');
    setError('');
    try {
      await axios.post('http://localhost:3001/api/disponibilites', form);
      setSuccess('Disponibilité ajoutée avec succès !');
      setForm({ technician_id: '', start: '', end: '' });
    } catch (err) {
      setError("Erreur lors de l'ajout de la disponibilité");
    }
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Form onSubmit={handleSubmit} className="mb-4" style={{ maxWidth: 500, margin: '0 auto' }}>
      <h5 className="mb-3">Ajouter une disponibilité</h5>
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Group className="mb-3">
        <Form.Label>Technicien</Form.Label>
        <Form.Select
          name="technician_id"
          value={form.technician_id}
          onChange={handleChange}
          required
        >
          <option value="">Sélectionner un technicien</option>
          {technicians.map(tech => (
            <option key={tech.id} value={tech.id}>
              {tech.first_name} {tech.last_name}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Date et heure de début</Form.Label>
        <Form.Control
          type="datetime-local"
          name="start"
          value={form.start}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Date et heure de fin</Form.Label>
        <Form.Control
          type="datetime-local"
          name="end"
          value={form.end}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Button type="submit" variant="primary" className="w-100">Ajouter</Button>
    </Form>
  );
};

export default DisponibiliteForm;