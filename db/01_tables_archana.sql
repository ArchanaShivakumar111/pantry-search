-- pgcrypto lets the seed file make bcrypt password hashes
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE users (
  user_id       SERIAL PRIMARY KEY,
  name          VARCHAR(100) NOT NULL CHECK (length(trim(name)) > 0),
  email         VARCHAR(150) NOT NULL UNIQUE CHECK (email LIKE '%_@_%._%'),
  password_hash TEXT NOT NULL,
  role          VARCHAR(20) NOT NULL CHECK (role IN ('donor', 'recipient', 'admin')),
  location      VARCHAR(100) NOT NULL,
  rating_avg    NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (rating_avg BETWEEN 0 AND 5)
);

CREATE TABLE category (
  category_id   SERIAL PRIMARY KEY,
  category_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE food_listing (
  listing_id      SERIAL PRIMARY KEY,
  donor_id        INT NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  category_id     INT NOT NULL REFERENCES category(category_id) ON DELETE RESTRICT,
  title           VARCHAR(200) NOT NULL CHECK (length(trim(title)) > 0),
  quantity        INT NOT NULL CHECK (quantity > 0),
  expiry_date     DATE NOT NULL,
  pickup_location VARCHAR(150) NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'available'
                  CHECK (status IN ('available', 'reserved', 'picked_up', 'expired'))
);
