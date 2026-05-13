/*
  # Add Error Logs Table for Admin Dashboard

  1. New Tables
    - `error_logs`
      - `id` (uuid, primary key)
      - `error_type` (text) - Type of error (payment_failed, signup_error, share_error, etc.)
      - `user_id` (uuid, nullable) - Reference to the user if applicable
      - `user_email` (text, nullable) - Email for quick reference
      - `error_message` (text) - The error message
      - `error_details` (jsonb, nullable) - Additional error context
      - `created_at` (timestamptz) - When the error occurred

  2. Security
    - Enable RLS on `error_logs` table
    - Only admins can read error logs (handled at application level)

  3. Indexes
    - Index on created_at for efficient date filtering
    - Index on error_type for filtering by type
*/

CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email text,
  error_message text NOT NULL,
  error_details jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only authenticated users can read error logs"
  ON error_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
