-- Mettre à jour 3 interventions pour aujourd'hui
UPDATE interventions 
SET scheduled_date = CURRENT_DATE + INTERVAL '8 hours' + (id * INTERVAL '2 hours')
WHERE id IN (
    SELECT id 
    FROM interventions 
    ORDER BY id 
    LIMIT 3
);

-- Mettre à jour les autres interventions sur les 15 prochains jours
UPDATE interventions 
SET scheduled_date = CURRENT_DATE + INTERVAL '1 day' + (id % 15) * INTERVAL '1 day' + INTERVAL '9 hours' + (id * INTERVAL '1 hour')
WHERE id NOT IN (
    SELECT id 
    FROM interventions 
    ORDER BY id 
    LIMIT 3
); 