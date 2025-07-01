import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import InterventionDetails from '../components/intervention/InterventionDetails';

const API_URL = process.env.REACT_APP_API_URL;

const InterventionView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [intervention, setIntervention] = useState(state?.intervention || null);

  const [user, setUser] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        let interventionData = intervention;
        if (!interventionData) {
          // Charger l'intervention depuis l'API si elle n'est pas dans le state
          const res = await axios.get(`${API_URL}/interventions/${id}`);
          interventionData = res.data;
          setIntervention(interventionData);
        }
        const userRes = await axios.get(`${API_URL}/users/${interventionData.user_id}`);
        setUser(userRes.data);
        const stocksRes = await axios.get(`${API_URL}/intervention-stocks/${interventionData.id}`);
        setStocks(stocksRes.data);
        const feedbacksRes = await axios.get(`${API_URL}/feedbacks/intervention/${interventionData.id}`);
        setFeedbacks(feedbacksRes.data);
      } catch (err) {
        setError("Erreur lors du chargement des détails de l'intervention");
      }
      setLoading(false);
    };
    fetchDetails();
    // eslint-disable-next-line
  }, [id]);

  const handleAskQuote = async () => {
  try {
    await axios.post(`${API_URL}/api/tasks`, {
      description: `Demande de facture pour l'intervention #${id} : ${intervention?.description || ''}`
    });
    alert('Demande envoyée !');
  } catch (err) {
    alert("Erreur lors de la demande");
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
