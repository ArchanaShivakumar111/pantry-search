INSERT INTO reservations (listing_id, recipient_id, status, pickup_time) VALUES
(8,  5, 'completed', NOW() - INTERVAL '1 day'),
(9,  6, 'completed', NOW() - INTERVAL '1 day'),
(10, 5, 'completed', NOW() - INTERVAL '2 hours'),
(7,  7, 'reserved',  NOW() + INTERVAL '1 day');

-- recipient reviews the donor of that listing (listing 8 -> donor 3, 9 -> 4, 10 -> 2)
INSERT INTO reviews (reservation_id, reviewer_id, reviewee_id, rating) VALUES
(1, 5, 3, 5),
(2, 6, 4, 4),
(3, 5, 2, 4);

INSERT INTO pantry_items (user_id, ingredient_name, quantity, unit) VALUES
(5, 'rice', 2, 'kg'), (5, 'onion', 1, 'kg'), (5, 'tomato', 500, 'g'),
(6, 'eggs', 6, 'pcs'), (6, 'milk', 1, 'l'), (6, 'bread', 1, 'packets'),
(7, 'toor dal', 1, 'kg'), (7, 'potato', 2, 'kg');
