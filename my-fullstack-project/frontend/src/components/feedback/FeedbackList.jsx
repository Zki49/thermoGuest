import React from 'react';
import FeedbackCard from './FeedbackCard';
import './FeedbackList.css';

const FeedbackList = ({ feedbacks }) => {
  return (
    <div className="feedback-list-vertical">
      {feedbacks.map((feedback) => (
        <div key={feedback.id} className="mb-4">
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