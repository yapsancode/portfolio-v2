-- Additive: keep historical score rows and the legacy run column intact.
CREATE TABLE IF NOT EXISTS olympus_progress (
  player_id uuid NOT NULL REFERENCES olympus_players(id),
  environment text NOT NULL CHECK (environment IN ('production', 'preview', 'development')),
  epoch uuid NOT NULL,
  highest_completed integer NOT NULL DEFAULT 0 CHECK (highest_completed BETWEEN 0 AND 100),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (player_id, environment)
);
ALTER TABLE olympus_sessions ADD COLUMN IF NOT EXISTS campaign_epoch uuid;
