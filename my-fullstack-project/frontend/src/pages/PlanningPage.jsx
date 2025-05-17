import React from 'react';
import { Container } from 'react-bootstrap';
import Navbar from '../components/navbar/Navbar';
import Planning from '../components/planning/Planning';

const PlanningPage = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <>
      {user && <Navbar user={user} onLogout={handleLogout} />}
      <Container fluid className="p-4">
        <Planning />
      </Container>
    </>
  );
};

export default PlanningPage; 