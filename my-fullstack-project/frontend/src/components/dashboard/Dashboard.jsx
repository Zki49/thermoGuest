import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
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
            <h2 className="mb-3">
              Interventions pour le {new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </h2>
            <InterventionCalendar userId={user?.id} role={user?.role} />
            <div className="mt-4">
              <h3>Tâches</h3>
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
    </div>
  );
};

export default Dashboard; 