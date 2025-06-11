import React from 'react';
import { Navbar as BootstrapNavbar, Container, Dropdown, Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Navbar = ({ user, onLogout }) => {
  const location = useLocation();

  return (
    <BootstrapNavbar bg="light" expand="lg" className="shadow-sm">
      <Container fluid>
        <BootstrapNavbar.Brand as={Link} to="/" className="fw-bold">ThermoGest</BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="navbarNav" />
        
        <BootstrapNavbar.Collapse id="navbarNav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={`d-flex align-items-center gap-2 ${location.pathname === '/' ? 'active' : ''}`}
            >
              <i className="bi bi-house"></i>
              Accueil
            </Nav.Link>
            {user.role !== 'user' && (
              <>
                <Nav.Link 
                  as={Link} 
                  to="/inventaire" 
                  className={`d-flex align-items-center gap-2 ${location.pathname === '/inventaire' ? 'active' : ''}`}
                >
                  <i className="bi bi-box-seam"></i>
                  Inventaire
                </Nav.Link>
                <Nav.Link 
                  as={Link} 
                  to="/planning" 
                  className={`d-flex align-items-center gap-2 ${location.pathname === '/planning' ? 'active' : ''}`}
                >
                  <i className="bi bi-calendar2-week"></i>
                  Planning
                </Nav.Link>
                {user.role !== 'technician' && (
                  <Nav.Link 
                    as={Link} 
                    to="/disponibilites" 
                    className={`d-flex align-items-center gap-2 ${location.pathname === '/disponibilites' ? 'active' : ''}`}
                  >
                    <i className="bi bi-clock-history"></i>
                    Disponibilités
                  </Nav.Link>
                )}
              </>
            )}
            <Nav.Link 
              as={Link} 
              to="/interventions" 
              className={`d-flex align-items-center gap-2 ${location.pathname === '/interventions' ? 'active' : ''}`}
            >
              <i className="bi bi-clipboard-check"></i>
              Interventions
            </Nav.Link>
            {user.role !== 'technician' && (
              <Nav.Link 
                as={Link} 
                to="/facturation" 
                className={`d-flex align-items-center gap-2 ${location.pathname === '/facturation' ? 'active' : ''}`}
              >
                <i className="bi bi-journal-text"></i>
                Facturations
              </Nav.Link>
            )}
          </Nav>
          
          <div>
            <Dropdown>
              <Dropdown.Toggle 
                variant="outline-primary" 
                id="dropdown-user"
                className="d-flex align-items-center gap-2"
              >
                <i className="bi bi-person-circle"></i>
                <span>{user.first_name} {user.last_name}</span>
              </Dropdown.Toggle>

              <Dropdown.Menu align="end">
                <Dropdown.ItemText>
                  <small className="text-muted d-block">Connecté en tant que</small>
                  <strong>{user.role}</strong>
                </Dropdown.ItemText>
                
                <Dropdown.Divider />
                
                <Dropdown.ItemText>
                  <small className="text-muted d-block">Email</small>
                  {user.email}
                </Dropdown.ItemText>
                
                <Dropdown.Divider />
                
                <Dropdown.Item 
                  className="text-danger d-flex align-items-center gap-2"
                  onClick={onLogout}
                >
                  <i className="bi bi-box-arrow-right"></i>
                  Se déconnecter
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar; 