-- Run once against the Neon database. Safe to run again.
BEGIN;

CREATE TABLE IF NOT EXISTS olympus_sessions (
  token_hash text PRIMARY KEY,
  id uuid NOT NULL UNIQUE,
  player_id uuid NOT NULL,
  game_version text NOT NULL,
  run integer NOT NULL CHECK (run BETWEEN 1 AND 1000),
  previous_hash text UNIQUE REFERENCES olympus_sessions(token_hash),
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  score integer CHECK (score > 0 AND score <= 100000 AND score % 10 = 0),
  duration_ms integer CHECK (duration_ms BETWEEN 1000 AND 3600000),
  outcome text CHECK (outcome IN ('won', 'lost')),
  initials text CHECK (initials ~ '^[A-Z0-9]{1,3}$'),
  published_at timestamptz,
  hidden boolean NOT NULL DEFAULT false,
  CHECK ((finished_at IS NULL AND score IS NULL AND outcome IS NULL AND duration_ms IS NULL)
      OR (finished_at IS NOT NULL AND score IS NOT NULL AND outcome IS NOT NULL AND duration_ms IS NOT NULL)),
  CHECK ((published_at IS NULL AND initials IS NULL)
      OR (published_at IS NOT NULL AND initials IS NOT NULL AND finished_at IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS olympus_ranking
  ON olympus_sessions (game_version, player_id, score DESC, run DESC, published_at, id)
  WHERE published_at IS NOT NULL AND hidden = false;

-- Shared, atomic fixed-window counters work across serverless instances.
-- Keys contain HMAC hashes, never raw IP addresses.
CREATE TABLE IF NOT EXISTS olympus_limits (
  key text PRIMARY KEY,
  hits integer NOT NULL,
  resets_at timestamptz NOT NULL
);

COMMIT;
