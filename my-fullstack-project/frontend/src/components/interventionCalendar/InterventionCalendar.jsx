import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import fr from 'date-fns/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';

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

const API_URL = process.env.REACT_APP_API_URL;

const InterventionCalendar = ({ userId, role }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const today = new Date();

  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        // Utiliser le nouvel endpoint pour les interventions du jour
        const url = `${API_URL}/interventions/today/${userId}`;
        console.log('Fetching today interventions from:', url);
        const response = await axios.get(url);
        console.log('Received today interventions:', response.data);
        
        // Transformer les interventions en événements pour le calendrier
        const events = response.data
          .filter(intervention => intervention.scheduled_date && intervention.description)
          .map(intervention => {
            // S'assurer que la date est correctement parsée
            const scheduledDate = new Date(intervention.scheduled_date);
            console.log('Original scheduled_date:', intervention.scheduled_date);
            console.log('Parsed date:', scheduledDate);
            
            // Créer les dates de début et de fin
            const startDate = new Date(scheduledDate);
            const endDate = new Date(scheduledDate);
            endDate.setHours(endDate.getHours() + 1);
            
            console.log('Event dates:', {
              start: startDate,
              end: endDate
            });
            
            return {
              id: intervention.id,
              title: intervention.description || 'Intervention',
              start: startDate,
              end: endDate,
              status: intervention.status,
              style: {
                backgroundColor: intervention.status === 'PLANIFIÉ' ? '#ffc107' :
                               intervention.status === 'EN_COURS' ? '#0d6efd' :
                               intervention.status === 'TERMINÉ' ? '#198754' : '#6c757d',
                borderRadius: '4px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block'
              }
            };
          });
        console.log('Transformed events:', events);
        setEvents(events);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching today interventions:', err);
        setError('Erreur lors du chargement des interventions');
        setLoading(false);
      }
    };
    if (userId) {
      fetchInterventions();
    }
  }, [userId]);

  if (loading) {
    return <div>Chargement du calendrier...</div>;
  }
  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div style={{ height: 500 }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        defaultView={Views.DAY}
        views={{ day: true }}
        date={today}
        toolbar={false}
        messages={{
          next: 'Suivant',
          previous: 'Précédent',
          today: "Aujourd'hui",
          month: 'Mois',
          week: 'Semaine',
          day: 'Jour',
          agenda: 'Agenda',
          date: 'Date',
          time: 'Heure',
          event: 'Intervention',
          noEventsInRange: 'Aucune intervention prévue.'
        }}
        culture="fr"
        style={{ background: 'white', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        eventPropGetter={(event) => ({
          style: event.style
        })}
        formats={{
          timeGutterFormat: (date, culture, localizer) =>
            localizer.format(date, 'HH:mm', culture),
          eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
            `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`
        }}
      />
    </div>
  );
};

export default InterventionCalendar; 