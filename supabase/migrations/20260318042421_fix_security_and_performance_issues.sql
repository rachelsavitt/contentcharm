/*
  # Fix Security and Performance Issues

  ## Performance Improvements
  1. Add missing index on error_logs(user_id) for foreign key performance
  2. Remove unused indexes:
     - idx_calendars_client_id on calendars table
     - idx_clients_user_id on clients table

  ## Security Fixes
  1. Fix RLS policy on email_logs table
     - Replace the overly permissive "Service role can insert email logs" policy
     - Create a restrictive policy that only allows service role access
  
  ## Notes
  - Auth DB connection strategy and leaked password protection must be configured 
    through Supabase Dashboard settings, not via SQL migrations
  - These settings are at: Settings > Database > Connection Pooling
  - Password protection: Settings > Authentication > Security
*/

-- Add index for error_logs foreign key to improve query performance
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);

-- Remove unused indexes
DROP INDEX IF EXISTS idx_calendars_client_id;
DROP INDEX IF EXISTS idx_clients_user_id;

-- Fix RLS policy on email_logs table
-- First, drop the existing overly permissive policy
DROP POLICY IF EXISTS "Service role can insert email logs" ON email_logs;

-- Create a restrictive policy that checks the service role JWT
-- Note: Regular authenticated users should not be able to insert email logs
-- Only the service role (used by Edge Functions) should have access
CREATE POLICY "Service role only can insert email logs"
  ON email_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.jwt()->>'role') = 'service_role'
  );