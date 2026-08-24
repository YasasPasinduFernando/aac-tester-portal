-- Persistent store for tester onboarding. Never store passwords or OAuth tokens.
CREATE TABLE tester_requests (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (
    status IN ('requested', 'invited', 'member', 'eligible', 'removed', 'error')
  ),
  requested_at TEXT NOT NULL,
  last_verified_at TEXT,
  last_download_check_at TEXT,
  last_website_activity_at TEXT,
  installed_confirmed_at TEXT,
  removed_at TEXT,
  error_message TEXT
);

CREATE INDEX idx_tester_requests_status ON tester_requests (status);
CREATE INDEX idx_tester_requests_requested_at ON tester_requests (requested_at);

CREATE TABLE feedback (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  feedback_type TEXT NOT NULL CHECK (
    feedback_type IN ('Bug', 'Suggestion', 'Usability', 'Accessibility', 'Other')
  ),
  message TEXT NOT NULL,
  screenshot_key TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_feedback_created_at ON feedback (created_at);

CREATE TABLE rate_limits (
  key TEXT PRIMARY KEY,
  window_start INTEGER NOT NULL,
  count INTEGER NOT NULL
);
