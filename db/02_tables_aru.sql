CREATE TABLE reservations (
  reservation_id SERIAL PRIMARY KEY,
  listing_id     INT NOT NULL REFERENCES food_listing(listing_id) ON DELETE RESTRICT,
  recipient_id   INT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  status         VARCHAR(20) NOT NULL DEFAULT 'reserved'
                 CHECK (status IN ('reserved', 'completed', 'cancelled')),
  pickup_time    TIMESTAMP NOT NULL
);

-- Safety net: a listing can have only ONE active (reserved or completed) reservation
CREATE UNIQUE INDEX uq_one_active_reservation
  ON reservations(listing_id) WHERE status IN ('reserved', 'completed');

CREATE TABLE reviews (
  review_id      SERIAL PRIMARY KEY,
  reservation_id INT NOT NULL UNIQUE REFERENCES reservations(reservation_id) ON DELETE CASCADE,
  reviewer_id    INT NOT NULL REFERENCES users(user_id),
  reviewee_id    INT NOT NULL REFERENCES users(user_id),
  rating         INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  CHECK (reviewer_id <> reviewee_id)
);

CREATE TABLE pantry_items (
  pantry_item_id  SERIAL PRIMARY KEY,
  user_id         INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  ingredient_name VARCHAR(100) NOT NULL CHECK (length(trim(ingredient_name)) > 0),
  quantity        NUMERIC(8,2) NOT NULL CHECK (quantity > 0),
  unit            VARCHAR(20) NOT NULL CHECK (unit IN ('g', 'kg', 'ml', 'l', 'pcs', 'cups', 'packets'))
);

CREATE TABLE saved_recipes (
  saved_id    SERIAL PRIMARY KEY,
  user_id     INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  recipe_ref  INT NOT NULL,
  match_score NUMERIC(4,3) NOT NULL CHECK (match_score BETWEEN 0 AND 1),
  UNIQUE (user_id, recipe_ref)
);
