-- Additive migration: existing previews can still write legacy initials.
CREATE TABLE IF NOT EXISTS olympus_players (
  id uuid PRIMARY KEY,
  name text NOT NULL CHECK (name ~ '^[A-Za-z0-9][A-Za-z0-9_]{2,15}$'),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS olympus_player_name_unique ON olympus_players (lower(name));

ALTER TABLE olympus_sessions ADD COLUMN IF NOT EXISTS player_name text
  CHECK (player_name ~ '^[A-Za-z0-9][A-Za-z0-9_]{2,15}$');
ALTER TABLE olympus_sessions DROP CONSTRAINT IF EXISTS olympus_sessions_check1;
ALTER TABLE olympus_sessions DROP CONSTRAINT IF EXISTS olympus_publication;
ALTER TABLE olympus_sessions ADD CONSTRAINT olympus_publication CHECK (
  (published_at IS NULL AND initials IS NULL AND player_name IS NULL)
  OR (published_at IS NOT NULL AND (initials IS NOT NULL OR player_name IS NOT NULL) AND finished_at IS NOT NULL)
);
