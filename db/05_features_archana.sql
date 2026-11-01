-- VIEW 1: food anyone can reserve right now
CREATE VIEW v_available_listings AS
SELECT f.listing_id, f.title, f.quantity, f.expiry_date, f.pickup_location, f.status,
       c.category_name, u.user_id AS donor_id, u.name AS donor_name, u.rating_avg AS donor_rating
FROM food_listing f
JOIN category c ON c.category_id = f.category_id
JOIN users u    ON u.user_id = f.donor_id
WHERE f.status = 'available' AND f.expiry_date >= CURRENT_DATE;

-- VIEW 2: one row per donor with their totals
CREATE VIEW v_donor_stats AS
SELECT u.user_id, u.name, u.location, u.rating_avg,
       COUNT(f.listing_id) AS total_listings,
       COUNT(f.listing_id) FILTER (WHERE f.status = 'picked_up') AS completed_pickups,
       COALESCE(SUM(f.quantity) FILTER (WHERE f.status = 'picked_up'), 0) AS quantity_saved
FROM users u
LEFT JOIN food_listing f ON f.donor_id = u.user_id
WHERE u.role = 'donor'
GROUP BY u.user_id;

-- INDEXES: make the common searches fast
CREATE INDEX idx_listing_status_expiry ON food_listing(status, expiry_date);
CREATE INDEX idx_listing_donor ON food_listing(donor_id);
-- FULL-TEXT SEARCH index on the title
CREATE INDEX idx_listing_title_fts ON food_listing USING GIN (to_tsvector('english', title));

-- TRIGGER: refuse listings that are already expired (a CHECK cannot use today's date)
CREATE OR REPLACE FUNCTION check_listing_expiry() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expiry_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Expiry date cannot be in the past';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_listing_expiry
BEFORE INSERT OR UPDATE OF expiry_date ON food_listing
FOR EACH ROW EXECUTE FUNCTION check_listing_expiry();

-- STORED FUNCTION: mark old food as expired; returns how many rows changed
CREATE OR REPLACE FUNCTION expire_old_listings() RETURNS INT AS $$
DECLARE n INT;
BEGIN
  UPDATE food_listing SET status = 'expired'
  WHERE status = 'available' AND expiry_date < CURRENT_DATE;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$ LANGUAGE plpgsql;
