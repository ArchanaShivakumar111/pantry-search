CREATE EXTENSION IF NOT EXISTS vector;
CREATE SCHEMA IF NOT EXISTS vec;

CREATE TABLE vec.listing_embeddings (
  listing_id    INT PRIMARY KEY REFERENCES public.food_listing(listing_id) ON DELETE CASCADE,
  embedded_text TEXT NOT NULL,           -- metadata: exactly what text was turned into numbers
  embedding     vector(384) NOT NULL
);

-- HNSW index = fast "find nearest vectors" using cosine distance
CREATE INDEX idx_listing_embedding ON vec.listing_embeddings USING hnsw (embedding vector_cosine_ops);
