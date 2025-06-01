import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/login/LoginForm';
import Dashboard from './components/dashboard/Dashboard';
import Inventaire from './components/inventaire/Inventaire';
import PlanningPage from './pages/PlanningPage';
import InterventionList from './components/intervention/InterventionList';
import Facturation from './components/facturation/Facturation';
import EditInvoice from './pages/EditInvoice';
import InterventionView from './pages/InterventionView';
import DisponibiliteGestion from './components/DisponibiliteForm/DisponibiliteGestion';
import axios from 'axios';

// Configuration d'axios
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:3001/api/verify-token');
          if (response.data.success) {
            setUser(response.data.user);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Erreur de vérification du token:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (data) => {
    setUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Chargement...</span>
      </div>
    </div>;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" /> : <LoginForm onLogin={handleLogin} />} 
        />
        <Route 
          path="/" 
          element={user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/inventaire" 
          element={user ? <Inventaire /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/planning" 
          element={user ? <PlanningPage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/interventions" 
          element={user ? <InterventionList /> : <Navigate to="/login" />} 
        />
        <Route
          path="/facturations"
          element={user ? <Facturation /> : <Navigate to="/login" />}
        />
        <Route
          path="/editInvoice/:id"
          element={user ? <EditInvoice /> : <Navigate to="/login" />}
        />
        <Route
          path="/interventions/:id"
          element={user ? <InterventionView /> : <Navigate to="/login" />}
        />
        <Route
          path="/disponibilites"
          element={user ? <DisponibiliteGestion /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App; 