-- Google Sign-In identity fields. Never store Google passwords, cookies, or OAuth tokens.
ALTER TABLE tester_requests ADD COLUMN google_email TEXT;
ALTER TABLE tester_requests ADD COLUMN google_subject_id TEXT;
ALTER TABLE tester_requests ADD COLUMN display_name TEXT;
ALTER TABLE tester_requests ADD COLUMN avatar_url TEXT;
ALTER TABLE tester_requests ADD COLUMN authenticated_at TEXT;

UPDATE tester_requests
SET google_email = email
WHERE google_email IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tester_requests_google_subject
  ON tester_requests (google_subject_id)
  WHERE google_subject_id IS NOT NULL;
