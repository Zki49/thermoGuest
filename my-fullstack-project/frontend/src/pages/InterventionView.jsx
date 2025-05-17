import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import InterventionDetails from '../components/intervention/InterventionDetails';

const InterventionView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const intervention = state?.intervention;

  const [user, setUser] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!intervention) return;
      setLoading(true);
      try {
        const userRes = await axios.get(`http://localhost:3001/api/users/${intervention.user_id}`);
        setUser(userRes.data);
        const stocksRes = await axios.get(`http://localhost:3001/api/intervention-stocks/${intervention.id}`);
        setStocks(stocksRes.data);
        const feedbacksRes = await axios.get(`http://localhost:3001/api/feedbacks/intervention/${intervention.id}`);
        setFeedbacks(feedbacksRes.data);
      } catch (err) {
        setError("Erreur lors du chargement des détails de l'intervention");
      }
      setLoading(false);
    };
    fetchDetails();
  }, [intervention]);

  const handleAskQuote = async () => {
    try {
      await axios.post('http://localhost:3001/api/tasks', {
        description: `Demande de devis pour l'intervention #${intervention.id} : ${intervention.description}`
      });
      alert('Demande de devis envoyée !');
    } catch (err) {
      alert("Erreur lors de la demande de devis");
    }
  };

  const handleFeedback = () => {
    // À compléter selon la logique de feedback
    alert('Fonctionnalité à venir');
  };

  return (
    <InterventionDetails
      intervention={intervention}
      user={user}
      stocks={stocks}
      feedbacks={feedbacks}
      loading={loading}
      error={error}
      navigate={navigate}
      onAskQuote={handleAskQuote}
      onFeedback={handleFeedback}
    />
  );
};

export default InterventionView; 