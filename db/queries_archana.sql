-- JOIN across 4 tables: every reservation with food, donor and recipient
SELECT r.reservation_id, f.title, d.name AS donor, rc.name AS recipient, r.status
FROM reservations r
JOIN food_listing f ON f.listing_id = r.listing_id
JOIN users d  ON d.user_id = f.donor_id
JOIN users rc ON rc.user_id = r.recipient_id
ORDER BY r.reservation_id;

-- GROUP BY + HAVING: categories with more than 1 listing
SELECT c.category_name, COUNT(*) AS listings
FROM food_listing f JOIN category c ON c.category_id = f.category_id
GROUP BY c.category_name HAVING COUNT(*) > 1;

-- Aggregates: average donor rating per area
SELECT location, ROUND(AVG(rating_avg), 2) AS avg_rating, COUNT(*) AS donors
FROM users WHERE role = 'donor' GROUP BY location ORDER BY avg_rating DESC;

-- Full-text search
SELECT title FROM food_listing WHERE to_tsvector('english', title) @@ plainto_tsquery('english', 'rice');

-- INDEX proof. The table is tiny, so PostgreSQL would normally skip the index;
-- turning off sequential scans forces it to show the index being used.
SET enable_seqscan = off;
EXPLAIN ANALYZE SELECT * FROM food_listing WHERE status = 'available' AND expiry_date >= CURRENT_DATE;
SET enable_seqscan = on;
