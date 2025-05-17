CREATE TABLE IF NOT EXISTS stocks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 0,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insérer quelques données de test
INSERT INTO stocks (name, description, quantity, unit_price, category) VALUES
('Tournevis cruciforme', 'Tournevis cruciforme de qualité professionnelle', 50, 12.99, 'Outillage'),
('Marteau 500g', 'Marteau à panne ronde 500g', 30, 24.99, 'Outillage'),
('Perceuse sans fil', 'Perceuse-visseuse sans fil 18V', 15, 89.99, 'Électroportatif'),
('Vis à bois 4x40', 'Boîte de 100 vis à bois 4x40', 200, 5.99, 'Quincaillerie'),
('Pince coupante', 'Pince coupante diagonale 160mm', 40, 15.99, 'Outillage'); 