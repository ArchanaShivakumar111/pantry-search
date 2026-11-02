-- SUBQUERY: recipients who have never written a review
SELECT name FROM users
WHERE role = 'recipient' AND user_id NOT IN (SELECT reviewer_id FROM reviews);

-- SUBQUERY: listings bigger than the average listing
SELECT title, quantity FROM food_listing
WHERE quantity > (SELECT AVG(quantity) FROM food_listing)
ORDER BY quantity DESC;

-- SUBQUERY (not correlated): donors rated above the average donor rating
SELECT name, rating_avg FROM users u
WHERE role = 'donor'
  AND rating_avg > (SELECT AVG(rating_avg) FROM users WHERE role = 'donor');

-- ORDER BY: food in my area first, then the most urgent
SELECT title, pickup_location, expiry_date FROM v_available_listings
ORDER BY (pickup_location = 'Banashankari') DESC, expiry_date ASC;

-- GROUP BY: how many reservations each recipient has, by status
SELECT u.name, r.status, COUNT(*) AS total
FROM reservations r JOIN users u ON u.user_id = r.recipient_id
GROUP BY u.name, r.status ORDER BY u.name;

-- CORRELATED SUBQUERY: listings bigger than the average quantity in their OWN category
-- (the inner query re-runs for every outer row, because it references f.category_id)
SELECT f.title, c.category_name, f.quantity
FROM food_listing f JOIN category c ON c.category_id = f.category_id
WHERE f.quantity > (
  SELECT AVG(f2.quantity) FROM food_listing f2 WHERE f2.category_id = f.category_id
)
ORDER BY c.category_name;
