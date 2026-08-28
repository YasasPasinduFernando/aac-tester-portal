-- Track whether a tester registered with Google Sign-In or a typed email.
-- Google sign-in upgrades an existing email row. Never invent group membership.
ALTER TABLE tester_requests ADD COLUMN signup_method TEXT NOT NULL DEFAULT 'email';

UPDATE tester_requests
SET signup_method = 'google'
WHERE google_subject_id IS NOT NULL AND TRIM(google_subject_id) != '';
