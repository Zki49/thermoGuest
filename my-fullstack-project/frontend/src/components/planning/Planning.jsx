import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import fr from 'date-fns/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './Planning.css';
import axios from 'axios';
import { Card, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
const API_URL = process.env.REACT_APP_API_URL;
const locales = {
  'fr': fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const Planning = ({ user: userProp }) => {
  const [user, setUser] = useState(userProp || null);
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userProp) {
      const userData = localStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    }
  }, [userProp]);

  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      try {
        const [interRes, techRes] = await Promise.all([
          axios.get(`${API_URL}/interventions`),
          axios.get(`${API_URL}/users/technicians`)
        ]);
        let events = interRes.data.map(intervention => ({
          id: intervention.id,
          title: intervention.description,
          start: new Date(intervention.scheduled_date),
          end: new Date(new Date(intervention.scheduled_date).getTime() + 60 * 60 * 1000),
          status: intervention.status,
          user_id: intervention.user_id
        }));
        if (user.role === 'technician') {
          events = events.filter(ev => String(ev.user_id) === String(user.id));
        }
        setAllEvents(events);
        setEvents(events);
        setTechnicians(techRes.data);
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors du chargement des événements:', err);
        setError('Erreur lors du chargement du planning');
        setLoading(false);
      }
    };
    fetchAll();
  }, [user]);

  const handleTechnicianChange = (e) => {
    const value = e.target.value;
    setSelectedTechnician(value);
    if (value === '') {
      setEvents(allEvents);
    } else {
      setEvents(allEvents.filter(ev => String(ev.user_id) === value));
    }
  };

  const handleEventClick = (event) => {
    navigate('/interventions', { state: { search: event.title } });
  };

  if (loading) {
    return <div>Chargement du planning...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h2 className="mb-0">Planning</h2>
      </Card.Header>
      <Card.Body>
        {user ? (
          user.role === 'admin' && (
            <Form.Group className="mb-3" controlId="technicianSelect">
              <Form.Label>Filtrer par technicien</Form.Label>
              <Form.Select value={selectedTechnician} onChange={handleTechnicianChange}>
                <option value="">Tous les techniciens</option>
                {technicians.map(tech => (
                  <option key={tech.id} value={tech.id}>{tech.first_name} {tech.last_name}</option>
                ))}
              </Form.Select>
            </Form.Group>
          )
        ) : null}
        <div style={{ height: 600, width: '100%', minWidth: 0 }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%', width: '100%' }}
            onSelectEvent={handleEventClick}
            views={['month', 'week', 'day']}
            messages={{
              next: 'Suivant',
              previous: 'Précédent',
              today: "Aujourd'hui",
              month: 'Mois',
              week: 'Semaine',
              day: 'Jour',
              date: 'Date',
              time: 'Heure',
              event: 'Événement',
              noEventsInRange: 'Aucun événement prévu.'
            }}
            culture="fr"
            eventPropGetter={(event) => ({
              style: {
                backgroundColor: event.status === 'PLANIFIÉ' ? '#ffc107' :
                               event.status === 'EN_COURS' ? '#0d6efd' :
                               event.status === 'TERMINÉ' ? '#198754' : '#6c757d',
                borderRadius: '4px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block'
              }
            })}
          />
        </div>
      </Card.Body>
    </Card>
  );
};

export default Planning; 