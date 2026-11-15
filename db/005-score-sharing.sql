-- One immutable ranking snapshot per shared result. Private session tokens stay private.
CREATE TABLE IF NOT EXISTS olympus_shares (
  session_id uuid PRIMARY KEY REFERENCES olympus_sessions(id),
  rank integer CHECK (rank BETWEEN 1 AND 3),
  shared_at timestamptz NOT NULL DEFAULT now()
);
