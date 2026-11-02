CREATE TABLE vec.recipes (
  recipe_id   SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  ingredients TEXT NOT NULL,
  steps       TEXT NOT NULL,
  embedding   vector(384)
);
CREATE INDEX idx_recipe_embedding ON vec.recipes USING hnsw (embedding vector_cosine_ops);
