-- Self-service onboarding fields. Recreate the table because SQLite cannot
-- replace a CHECK constraint in place.
CREATE TABLE tester_requests_new (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (
    status IN ('requested', 'group_pending', 'play_pending', 'completed', 'needs_attention')
  ),
  requested_at TEXT NOT NULL,
  group_join_started_at TEXT,
  play_join_started_at TEXT,
  feedback_submitted INTEGER NOT NULL DEFAULT 0,
  last_activity_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  membership_verified INTEGER NOT NULL DEFAULT 0,
  membership_verified_at TEXT,
  notes TEXT
);

INSERT INTO tester_requests_new (
  id, email, status, requested_at, group_join_started_at, play_join_started_at,
  feedback_submitted, last_activity_at, created_at, updated_at,
  membership_verified, membership_verified_at, notes
)
SELECT
  id,
  email,
  CASE
    WHEN status IN ('member', 'eligible') THEN 'play_pending'
    WHEN status = 'invited' THEN 'group_pending'
    WHEN status IN ('error', 'removed') THEN 'needs_attention'
    ELSE 'requested'
  END,
  requested_at,
  NULL,
  NULL,
  0,
  COALESCE(last_website_activity_at, requested_at),
  requested_at,
  COALESCE(last_website_activity_at, requested_at),
  0,
  last_verified_at,
  error_message
FROM tester_requests;

DROP TABLE tester_requests;
ALTER TABLE tester_requests_new RENAME TO tester_requests;

CREATE INDEX idx_tester_requests_status ON tester_requests (status);
CREATE INDEX idx_tester_requests_requested_at ON tester_requests (requested_at);
CREATE INDEX idx_tester_requests_updated_at ON tester_requests (updated_at);
