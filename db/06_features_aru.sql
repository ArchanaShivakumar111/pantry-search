-- STORED FUNCTION + TRANSACTION: reserve a listing safely.
-- FOR UPDATE locks the listing row, so if two people click Reserve at the same moment,
-- the second one waits, then sees status = 'reserved' and gets an error.
CREATE OR REPLACE FUNCTION reserve_listing(p_listing INT, p_recipient INT, p_pickup TIMESTAMP)
RETURNS INT AS $$
DECLARE
  v_status VARCHAR(20);
  v_expiry DATE;
  v_role   VARCHAR(20);
  v_id     INT;
BEGIN
  SELECT role INTO v_role FROM users WHERE user_id = p_recipient;
  IF v_role IS DISTINCT FROM 'recipient' THEN
    RAISE EXCEPTION 'Only recipients can reserve food';
  END IF;

  SELECT status, expiry_date INTO v_status, v_expiry
  FROM food_listing WHERE listing_id = p_listing
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'This listing does not exist'; END IF;
  IF v_status <> 'available' THEN RAISE EXCEPTION 'Sorry, someone already reserved this food'; END IF;
  IF v_expiry < CURRENT_DATE THEN RAISE EXCEPTION 'This food has expired'; END IF;
  IF p_pickup < NOW() THEN RAISE EXCEPTION 'Pickup time must be in the future'; END IF;

  INSERT INTO reservations (listing_id, recipient_id, status, pickup_time)
  VALUES (p_listing, p_recipient, 'reserved', p_pickup)
  RETURNING reservation_id INTO v_id;

  UPDATE food_listing SET status = 'reserved' WHERE listing_id = p_listing;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 1: a review is only allowed after pickup, by that reservation's recipient, about that listing's donor
CREATE OR REPLACE FUNCTION check_review() RETURNS TRIGGER AS $$
DECLARE
  v_status    VARCHAR(20);
  v_recipient INT;
  v_donor     INT;
BEGIN
  SELECT r.status, r.recipient_id, f.donor_id INTO v_status, v_recipient, v_donor
  FROM reservations r JOIN food_listing f ON f.listing_id = r.listing_id
  WHERE r.reservation_id = NEW.reservation_id;

  IF v_status IS DISTINCT FROM 'completed' THEN
    RAISE EXCEPTION 'You can only review after the pickup is completed';
  END IF;
  IF NEW.reviewer_id <> v_recipient OR NEW.reviewee_id <> v_donor THEN
    RAISE EXCEPTION 'Only the recipient of this reservation can review its donor';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_review
BEFORE INSERT ON reviews
FOR EACH ROW EXECUTE FUNCTION check_review();

-- TRIGGER 2: keep users.rating_avg (the derived attribute) correct automatically
CREATE OR REPLACE FUNCTION update_rating_avg() RETURNS TRIGGER AS $$
DECLARE v_user INT;
BEGIN
  v_user := COALESCE(NEW.reviewee_id, OLD.reviewee_id);
  UPDATE users
  SET rating_avg = COALESCE((SELECT ROUND(AVG(rating), 2) FROM reviews WHERE reviewee_id = v_user), 0)
  WHERE user_id = v_user;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_rating
AFTER INSERT OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_rating_avg();

-- TRIGGER 3: when a reservation is cancelled or completed, update the listing to match
CREATE OR REPLACE FUNCTION sync_listing_status() RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status <> 'reserved' AND NEW.status <> OLD.status THEN
    RAISE EXCEPTION 'Only active reservations can be changed';
  END IF;
  IF NEW.status = 'cancelled' AND OLD.status = 'reserved' THEN
    UPDATE food_listing SET status = 'available' WHERE listing_id = NEW.listing_id;
  ELSIF NEW.status = 'completed' AND OLD.status = 'reserved' THEN
    UPDATE food_listing SET status = 'picked_up' WHERE listing_id = NEW.listing_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_listing_status
AFTER UPDATE OF status ON reservations
FOR EACH ROW EXECUTE FUNCTION sync_listing_status();
