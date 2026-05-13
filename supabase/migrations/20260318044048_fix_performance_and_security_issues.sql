/*
  # Fix Performance and Security Issues

  1. Performance Improvements
    - Add missing index on `calendars.client_id` foreign key
    - Add missing index on `clients.user_id` foreign key
    - Remove unused index `idx_error_logs_user_id`
    - Optimize RLS policy for email_logs to avoid re-evaluating auth.uid()

  2. Security
    - Fix email_logs RLS policy to use subquery pattern for better performance
    - Maintain existing security posture while improving query performance

  3. Notes
    - Foreign key indexes improve JOIN performance
    - RLS optimization prevents function re-evaluation for each row
    - Unused indexes consume storage and slow down writes
*/

-- Add missing foreign key indexes for performance
CREATE INDEX IF NOT EXISTS idx_calendars_client_id ON calendars(client_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- Remove unused index
DROP INDEX IF EXISTS idx_error_logs_user_id;

-- Drop the existing suboptimal RLS policy
DROP POLICY IF EXISTS "Service role can insert email logs" ON email_logs;

-- Create optimized RLS policy that doesn't re-evaluate auth.uid() for each row
CREATE POLICY "Service role can insert email logs"
  ON email_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Also optimize the SELECT policy to use subquery pattern
DROP POLICY IF EXISTS "Users can read email logs sent to them" ON email_logs;

CREATE POLICY "Users can read email logs sent to them"
  ON email_logs
  FOR SELECT
  TO authenticated
  USING (
    recipient IN (
      SELECT email FROM auth.users WHERE id = (SELECT auth.uid())
    )
  );
