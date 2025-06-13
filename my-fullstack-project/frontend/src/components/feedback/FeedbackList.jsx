import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FeedbackCard from './FeedbackCard';
import './FeedbackList.css';

const API_URL = process.env.REACT_APP_API_URL;

const FeedbackList = ({ feedbacks }) => {
  const navigate = useNavigate();

  const handleFeedbackClick = async (feedback) => {
    try {
      const res = await axios.get(`${API_URL}/interventions/${feedback.intervention_id}`);
      const intervention = res.data;
      // Redirige vers la liste des interventions avec la description dans le state
      navigate('/interventions', { state: { search: intervention.description } });
    } catch (err) {
      alert("Impossible de récupérer l'intervention liée.");
    }
  };

  return (
    <div className="feedback-list-vertical">
      {feedbacks.map((feedback) => (
        <div
          key={feedback.id}
          className="mb-4"
          onClick={() => handleFeedbackClick(feedback)}
          style={{ cursor: 'pointer' }}
        >
          <FeedbackCard
            feedback={{
              name: (feedback.client?.first_name || '') + ' ' + (feedback.client?.last_name || 'Utilisateur'),
              date: feedback.created_at,
              rating: feedback.rating,
              comment: feedback.comment
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default FeedbackList; 