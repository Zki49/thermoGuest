import React from 'react';
import { Card } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';
import './FeedbackCard.css';

const FeedbackCard = ({ feedback }) => {
  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? 'star filled' : 'star'}
        size={20}
      />
    ));
  };

  return (
    <Card className="feedback-card mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <Card.Title>{feedback.name}</Card.Title>
            <Card.Subtitle className="mb-2 text-muted">
              {new Date(feedback.date).toLocaleDateString()}
            </Card.Subtitle>
          </div>
          <div className="stars-container">
            {renderStars(feedback.rating)}
          </div>
        </div>
        <Card.Text className="mt-3">{feedback.comment}</Card.Text>
        {feedback.actions && (
          <div className="mt-3">
            {feedback.actions}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default FeedbackCard; 