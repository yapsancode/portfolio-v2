-- Named players have only been offered on previews so far. Keep those names
-- available on production when this feature ships. Local testing is separate.
ALTER TABLE olympus_players ADD COLUMN IF NOT EXISTS environment text NOT NULL DEFAULT 'preview'
  CHECK (environment IN ('production', 'preview', 'development'));
DROP INDEX IF EXISTS olympus_player_name_unique;
CREATE UNIQUE INDEX IF NOT EXISTS olympus_player_name_per_environment
  ON olympus_players (environment, lower(name));
