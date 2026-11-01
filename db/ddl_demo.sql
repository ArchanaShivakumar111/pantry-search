-- ALTER: add a new rule to an existing table
ALTER TABLE category ADD CONSTRAINT chk_category_name_len CHECK (length(category_name) >= 3);
-- ALTER: give a column a default value
ALTER TABLE food_listing ALTER COLUMN pickup_location SET DEFAULT 'Banashankari';
-- DROP + CREATE an index
DROP INDEX idx_listing_donor;
CREATE INDEX idx_listing_donor ON food_listing(donor_id);
-- DROP + CREATE a throwaway table
CREATE TABLE temp_demo (id INT PRIMARY KEY);
DROP TABLE temp_demo;
