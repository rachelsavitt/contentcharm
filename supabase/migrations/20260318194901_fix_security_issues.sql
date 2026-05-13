/*
  # Fix Security and Performance Issues

  1. Performance Improvements
    - Add index for error_logs.user_id foreign key for better query performance
    - Remove unused indexes on calendars.client_id and clients.user_id
  
  2. Security Improvements
    - Fix RLS policy on email_logs table to be properly restrictive
    - Replace "always true" WITH CHECK clause with actual authentication check
  
  3. Notes
    - Indexes improve query performance for foreign key lookups
    - RLS policies should never allow unrestricted access
    - Service role access should be limited to server-side operations only
*/

-- Add missing index for error_logs.user_id foreign key
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON public.error_logs(user_id);

-- Remove unused indexes
DROP INDEX IF EXISTS idx_calendars_client_id;
DROP INDEX IF EXISTS idx_clients_user_id;

-- Fix email_logs RLS policy - remove the "always true" policy and replace with proper access control
DROP POLICY IF EXISTS "Service role can insert email logs" ON public.email_logs;

-- Only allow service role to insert email logs (not regular authenticated users)
-- This policy will only work when called from server-side functions with service role key
CREATE POLICY "System can insert email logs"
  ON public.email_logs
  FOR INSERT
  WITH CHECK (
    -- This ensures only service role can insert, not regular authenticated users
    auth.role() = 'service_role'
  );

-- Allow users to view their own email logs (if they are the recipient)
DROP POLICY IF EXISTS "Users can view own email logs" ON public.email_logs;
CREATE POLICY "Users can view own email logs"
  ON public.email_logs
  FOR SELECT
  TO authenticated
  USING (
    recipient = auth.jwt() ->> 'email'
  );