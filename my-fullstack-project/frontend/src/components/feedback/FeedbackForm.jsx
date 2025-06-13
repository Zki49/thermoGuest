import React, { useState } from 'react';
import axios from 'axios';
import './FeedbackForm.css';

const API_URL = process.env.REACT_APP_API_URL;

const FeedbackForm = ({ interventionId, clientId, onFeedbackSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(`${API_URL}/feedbacks`, {
        intervention_id: interventionId,
        client_id: clientId,
        rating,
        comment
      });

      if (response.status === 201) {
        setRating(0);
        setComment('');
        if (onFeedbackSubmitted) {
          onFeedbackSubmitted(response.data);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue lors de l\'envoi du feedback');
    }
  };

  return (
    <div className="feedback-form-container">
      <h3>Laisser un feedback</h3>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="rating-container">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${star <= (hoveredRating || rating) ? 'filled' : ''}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
            >
              ★
            </span>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Votre commentaire (optionnel)"
          rows="4"
        />
        <button 
          type="submit" 
          disabled={rating === 0}
          className={rating === 0 ? 'disabled' : ''}
        >
          Envoyer
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm; 