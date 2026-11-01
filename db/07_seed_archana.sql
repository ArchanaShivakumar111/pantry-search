INSERT INTO users (name, email, password_hash, role, location) VALUES
('Admin',              'admin@pantry.com', crypt('password123', gen_salt('bf')), 'admin',     'Banashankari'),
('Hotel Annapoorna',   'annapoorna@pantry.com', crypt('password123', gen_salt('bf')), 'donor', 'Banashankari'),
('PES Hostel Mess',    'hostel@pantry.com', crypt('password123', gen_salt('bf')), 'donor',    'Banashankari'),
('Priya Household',    'priya@pantry.com', crypt('password123', gen_salt('bf')), 'donor',     'Jayanagar'),
('Asha Seva NGO',      'asha@pantry.com', crypt('password123', gen_salt('bf')), 'recipient',  'Banashankari'),
('Ravi Student',       'ravi@pantry.com', crypt('password123', gen_salt('bf')), 'recipient',  'Jayanagar'),
('Meena Family',       'meena@pantry.com', crypt('password123', gen_salt('bf')), 'recipient', 'Koramangala');

INSERT INTO category (category_name) VALUES
('Cooked Meals'), ('Raw Vegetables'), ('Bakery'), ('Dairy'), ('Grains and Pulses'), ('Fruits');

INSERT INTO food_listing (donor_id, category_id, title, quantity, expiry_date, pickup_location, status) VALUES
(2, 1, 'Paneer butter masala with jeera rice', 15, CURRENT_DATE + 1,  'Banashankari', 'available'),
(3, 1, 'Vegetable pulao and raita',            25, CURRENT_DATE + 1,  'Banashankari', 'available'),
(4, 2, 'Fresh tomatoes and onions',             5, CURRENT_DATE + 3,  'Jayanagar',    'available'),
(2, 3, 'Whole wheat bread loaves',              8, CURRENT_DATE + 2,  'Banashankari', 'available'),
(3, 4, 'Curd and buttermilk packets',          20, CURRENT_DATE + 1,  'Banashankari', 'available'),
(4, 5, 'Toor dal and basmati rice bags',        4, CURRENT_DATE + 30, 'Jayanagar',    'available'),
(2, 6, 'Bananas and apples',                   12, CURRENT_DATE + 2,  'Banashankari', 'reserved'),
(3, 1, 'Chapati and dal tadka',                30, CURRENT_DATE,      'Banashankari', 'picked_up'),
(4, 2, 'Spinach and carrots',                   3, CURRENT_DATE,      'Jayanagar',    'picked_up'),
(2, 3, 'Assorted buns and cookies',            10, CURRENT_DATE,      'Banashankari', 'picked_up');
