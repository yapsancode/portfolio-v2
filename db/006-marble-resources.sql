-- Additive resource bank. Historical scores never mint currency retroactively.
ALTER TABLE olympus_progress ADD COLUMN IF NOT EXISTS marble bigint NOT NULL DEFAULT 0 CHECK (marble BETWEEN 0 AND 9007199254740991);
ALTER TABLE olympus_progress ADD COLUMN IF NOT EXISTS lifetime_marble bigint NOT NULL DEFAULT 0 CHECK (lifetime_marble BETWEEN 0 AND 9007199254740991 AND lifetime_marble >= marble);
ALTER TABLE olympus_progress ADD COLUMN IF NOT EXISTS furthest_level integer NOT NULL DEFAULT 0 CHECK (furthest_level BETWEEN 0 AND 100);
ALTER TABLE olympus_progress ADD COLUMN IF NOT EXISTS hull_level integer NOT NULL DEFAULT 0 CHECK (hull_level BETWEEN 0 AND 3);
ALTER TABLE olympus_progress ADD COLUMN IF NOT EXISTS blaster_level integer NOT NULL DEFAULT 0 CHECK (blaster_level BETWEEN 0 AND 4);
ALTER TABLE olympus_progress ADD COLUMN IF NOT EXISTS shield_level integer NOT NULL DEFAULT 0 CHECK (shield_level BETWEEN 0 AND 4 AND hull_level + blaster_level + shield_level <= furthest_level / 10);
UPDATE olympus_progress SET furthest_level = GREATEST(furthest_level, highest_completed);
