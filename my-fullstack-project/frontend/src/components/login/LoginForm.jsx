import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      console.log('Envoi de la requête de connexion...', { email, password });
      
      const response = await axios.post('http://localhost:3001/api/login', 
        { email, password },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log('Réponse complète:', response);
      console.log('Données reçues:', response.data);
      
      if (response.data.success) {
        setResponse(response.data);
        onLogin(response.data);
      } else {
        setError(response.data.message || 'Erreur de connexion');
      }
    } catch (err) {
      console.error('Erreur détaillée:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        headers: err.response?.headers
      });
      
      if (err.response) {
        // La requête a été faite et le serveur a répondu avec un code d'état
        setError(err.response.data.message || 'Erreur de connexion');
      } else if (err.request) {
        // La requête a été faite mais aucune réponse n'a été reçue
        setError('Le serveur ne répond pas. Veuillez réessayer plus tard.');
      } else {
        // Une erreur s'est produite lors de la configuration de la requête
        setError('Erreur lors de la connexion: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      const response = await axios.post('http://localhost:3001/api/loginAsAdmin');
      
      if (response.data.success) {
        setResponse(response.data);
        onLogin(response.data);
      } else {
        setError(response.data.message || 'Erreur de connexion admin');
      }
    } catch (err) {
      console.error('Erreur lors de la connexion admin:', err);
      setError(err.response?.data?.message || 'Erreur lors de la connexion admin');
    } finally {
      setLoading(false);
    }
  };

  const handleTechnician1Login = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      const response = await axios.post('http://localhost:3001/api/loginAsTechnician1');
      
      if (response.data.success) {
        setResponse(response.data);
        onLogin(response.data);
      } else {
        setError(response.data.message || 'Erreur de connexion technicien 1');
      }
    } catch (err) {
      console.error('Erreur lors de la connexion technicien 1:', err);
      setError(err.response?.data?.message || 'Erreur lors de la connexion technicien 1');
    } finally {
      setLoading(false);
    }
  };

  const handleTechnician2Login = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      const response = await axios.post('http://localhost:3001/api/loginAsTechnician2');
      
      if (response.data.success) {
        setResponse(response.data);
        onLogin(response.data);
      } else {
        setError(response.data.message || 'Erreur de connexion technicien 2');
      }
    } catch (err) {
      console.error('Erreur lors de la connexion technicien 2:', err);
      setError(err.response?.data?.message || 'Erreur lors de la connexion technicien 2');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row vh-100">
        {/* Partie gauche : dégradé et message */}
        <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center bg-primary bg-gradient">
          <div className="text-white text-center">
            <h1 className="display-4 fw-bold">Welcome Back!</h1>
          </div>
        </div>
        
        {/* Partie droite : formulaire */}
        <div className="col-md-6 d-flex align-items-center justify-content-center">
          <div className="w-100 p-4" style={{ maxWidth: '400px' }}>
            <h2 className="mb-2">Login</h2>
            <p className="text-muted mb-4">Welcome back! Please login to your account.</p>
            
            {error && (
              <div className="alert alert-danger" role="alert">
                <h4 className="alert-heading">Erreur!</h4>
                <p>{error}</p>
              </div>
            )}

            {response && (
              <div className="alert alert-success" role="alert">
                <h4 className="alert-heading">Connexion réussie!</h4>
                <p>Bienvenue {response.user.first_name} {response.user.last_name}</p>
                <hr />
                <p className="mb-0">Rôle: {response.user.role}</p>
                <p className="mb-0">Email: {response.user.email}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">E-mail</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="username@gmail.com"
                  required
                />
              </div>

              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="********"
                  required
                />
              </div>

            

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 mb-3"
                disabled={loading}
              >
                {loading ? 'Connexion...' : 'Login'}
              </button>

              <div className="text-center mb-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100 mb-2"
                  onClick={handleAdminLogin}
                  disabled={loading}
                >
                  {loading ? 'Connexion...' : 'Se connecter en tant qu\'Admin'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100 mb-2"
                  onClick={handleTechnician1Login}
                  disabled={loading}
                >
                  {loading ? 'Connexion...' : 'Se connecter en tant que Technicien 1'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100"
                  onClick={handleTechnician2Login}
                  disabled={loading}
                >
                  {loading ? 'Connexion...' : 'Se connecter en tant que Technicien 2'}
                </button>
              </div>
            </form>

            <div className="text-center mt-3">
              <span className="text-muted">New User? </span>
              <a href="#" className="text-decoration-none">Signup</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 