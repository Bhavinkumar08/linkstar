
ALTER TABLE links
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();