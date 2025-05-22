import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button, Modal, Form } from 'react-bootstrap';
import Navbar from '../navbar/Navbar';
import FeedbackList from '../feedback/FeedbackList';
import InterventionCalendar from '../interventionCalendar/InterventionCalendar';
import './Dashboard.css';
import axios from 'axios';

const Dashboard = ({ user, onLogout }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [errorTasks, setErrorTasks] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [creatingTask, setCreatingTask] = useState(false);
  const [taskError, setTaskError] = useState(null);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/feedbacks');
        setFeedbacks(response.data);
        setLoading(false);
      } catch (err) {
        setError('Erreur lors du chargement des feedbacks');
        setLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        let url = 'http://localhost:3001/api/tasks';
        if (user?.role !== 'admin') {
          url += `?employee=${user.id}`;
        }
        const res = await axios.get(url);
        setTasks(res.data);
        setLoadingTasks(false);
      } catch (err) {
        setErrorTasks('Erreur lors du chargement des tâches');
        setLoadingTasks(false);
      }
    };
    if (user?.id) fetchTasks();
  }, [user]);

  useEffect(() => {
    if (user?.role === 'admin' && showTaskModal) {
      axios.get('http://localhost:3001/api/users/technicians')
        .then(res => setTechnicians(res.data))
        .catch(() => setTechnicians([]));
    }
  }, [user, showTaskModal]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setCreatingTask(true);
    setTaskError(null);
    try {
      await axios.post('http://localhost:3001/api/tasks', {
        employee: selectedTechnician,
        description: taskDescription
      });
      setShowTaskModal(false);
      setSelectedTechnician('');
      setTaskDescription('');
      if (user?.id) {
        let url = 'http://localhost:3001/api/tasks';
        if (user?.role !== 'admin') {
          url += `?employee=${user.id}`;
        }
        const res = await axios.get(url);
        setTasks(res.data);
      }
    } catch (err) {
      setTaskError("Erreur lors de la création de la tâche");
    } finally {
      setCreatingTask(false);
    }
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
    <div>
      <Navbar user={user} onLogout={onLogout} />
      <Container className="mt-4">
        <Row>
          <Col md={6} className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="mb-0">
                Interventions pour le {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </h2>
              {user?.role === 'admin' && (
                <Button variant="primary" onClick={() => setShowTaskModal(true)}>
                  + Créer une tâche
                </Button>
              )}
            </div>
            <InterventionCalendar userId={user?.id} role={user?.role} />
            <div className="mt-4">
              <h3>Tâches</h3>
              {user?.role === 'admin' && (
                <div className="mb-3">
                  <Button variant="primary" onClick={() => setShowTaskModal(true)}>
                    + Créer une tâche
                  </Button>
                </div>
              )}
              {loadingTasks ? (
                <Spinner animation="border" />
              ) : errorTasks ? (
                <Alert variant="danger">{errorTasks}</Alert>
              ) : tasks.length === 0 ? (
                <Alert variant="info">Aucune tâche à afficher.</Alert>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  {tasks.map(task => (
                    <Card key={task.id} style={{ minWidth: 250, maxWidth: 350 }}>
                      <Card.Body>
                        <Card.Title>{task.description}</Card.Title>
                        <Card.Text>
                          <b>Statut :</b> {task.status}<br />
                          <b>Créée le :</b> {new Date(task.date_created).toLocaleString('fr-FR')}
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Col>
          <Col md={6}>
            <h2 className="mb-4">Feedbacks des utilisateurs</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <FeedbackList feedbacks={feedbacks} />
            </div>
          </Col>
        </Row>
      </Container>
      <Modal show={showTaskModal} onHide={() => setShowTaskModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Créer une tâche</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateTask}>
          <Modal.Body>
            {taskError && <Alert variant="danger">{taskError}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Technicien</Form.Label>
              <Form.Select
                value={selectedTechnician}
                onChange={e => setSelectedTechnician(e.target.value)}
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
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={taskDescription}
                onChange={e => setTaskDescription(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowTaskModal(false)}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={creatingTask}>
              Créer
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Dashboard; 