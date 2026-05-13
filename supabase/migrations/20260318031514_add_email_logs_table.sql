/*
  # Add Email Logs Table

  1. New Tables
    - `email_logs`
      - `id` (uuid, primary key)
      - `recipient` (text) - Email address of recipient
      - `email_type` (text) - Type of email (calendar_share, feedback_notification, welcome, trial_reminder, payment_failed)
      - `subject` (text) - Email subject line
      - `status` (text) - success or failed
      - `error_message` (text, nullable) - Error details if failed
      - `metadata` (jsonb, nullable) - Additional context (calendar_id, user_id, etc.)
      - `sent_at` (timestamptz) - When the email was sent/attempted

  2. Security
    - Enable RLS on `email_logs` table
    - Users can only read their own email logs
    - System can insert logs (handled at edge function level)

  3. Indexes
    - Index on sent_at for efficient date filtering
    - Index on email_type for filtering by type
    - Index on recipient for lookup
*/

CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient text NOT NULL,
  email_type text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'success',
  error_message text,
  metadata jsonb,
  sent_at timestamptz DEFAULT now()
);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read email logs sent to them"
  ON email_logs
  FOR SELECT
  TO authenticated
  USING (
    recipient IN (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert email logs"
  ON email_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_logs_email_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient);
