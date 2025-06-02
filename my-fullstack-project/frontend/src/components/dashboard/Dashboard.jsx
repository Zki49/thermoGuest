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
  const [showAllFeedbacks, setShowAllFeedbacks] = useState(false);
  const [currentFeedbackPage, setCurrentFeedbackPage] = useState(1);
  const feedbacksPerPage = 3;

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

  const handleStatusChange = async (taskId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'À_FAIRE' ? 'FAIT' : 'À_FAIRE';
      
      // Mettre à jour le statut dans la base de données
      await axios.patch(`http://localhost:3001/api/tasks/${taskId}/status`, {
        status: newStatus
      });
      
      // Recharger toutes les tâches
      let url = 'http://localhost:3001/api/tasks';
      if (user?.role !== 'admin') {
        url += `?employee=${user.id}`;
      }
      const res = await axios.get(url);
      setTasks(res.data);
      
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      // En cas d'erreur, recharger quand même les tâches
      try {
        let url = 'http://localhost:3001/api/tasks';
        if (user?.role !== 'admin') {
          url += `?employee=${user.id}`;
        }
        const res = await axios.get(url);
        setTasks(res.data);
      } catch (reloadErr) {
        console.error('Erreur lors du rechargement des tâches:', reloadErr);
      }
    }
  };

  // Pagination feedbacks
  const totalFeedbackPages = Math.ceil(feedbacks.length / feedbacksPerPage);
  const paginatedFeedbacks = feedbacks
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice((currentFeedbackPage - 1) * feedbacksPerPage, currentFeedbackPage * feedbacksPerPage);

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
            </div>
            <InterventionCalendar userId={user?.id} role={user?.role} />
            <div className="mt-4">
              <h3>Tâches à faire</h3>
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
                        <div className="d-flex justify-content-between align-items-start">
                          <Card.Title>{task.description}</Card.Title>
                          <Form.Check
                            type="checkbox"
                            checked={task.status === 'FAIT'}
                            onChange={() => handleStatusChange(task.id, task.status)}
                            label={task.status === 'FAIT' ? 'Fait' : 'À faire'}
                          />
                        </div>
                        <Card.Text>
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
              <FeedbackList feedbacks={paginatedFeedbacks} />
              {/* Pagination */}
              {totalFeedbackPages > 1 && (
                <div className="d-flex justify-content-center mt-3">
                  <nav>
                    <ul className="pagination">
                      <li className={`page-item${currentFeedbackPage === 1 ? ' disabled' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentFeedbackPage(currentFeedbackPage - 1)} disabled={currentFeedbackPage === 1}>&laquo;</button>
                      </li>
                      {Array.from({ length: totalFeedbackPages }, (_, i) => (
                        <li key={i + 1} className={`page-item${currentFeedbackPage === i + 1 ? ' active' : ''}`}>
                          <button className="page-link" onClick={() => setCurrentFeedbackPage(i + 1)}>{i + 1}</button>
                        </li>
                      ))}
                      <li className={`page-item${currentFeedbackPage === totalFeedbackPages ? ' disabled' : ''}`}>
                        <button className="page-link" onClick={() => setCurrentFeedbackPage(currentFeedbackPage + 1)} disabled={currentFeedbackPage === totalFeedbackPages}>&raquo;</button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
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