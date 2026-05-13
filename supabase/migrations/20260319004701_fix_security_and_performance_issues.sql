/*
  # Fix Security and Performance Issues

  ## Performance Improvements
  
  1. **Add Missing Indexes**
     - Add index on `calendars.client_id` for foreign key lookup performance
     - Add index on `clients.user_id` for foreign key lookup performance
  
  2. **Optimize RLS Policies**
     - Fix `email_logs` policies to use `(select auth.uid())` and `(select auth.jwt())` patterns
     - Remove duplicate permissive SELECT policy on `email_logs`
  
  3. **Clean Up Unused Indexes**
     - Remove unused `idx_error_logs_user_id` index
  
  ## Changes Made
  
  - Index on `calendars(client_id)` for FK performance
  - Index on `clients(user_id)` for FK performance
  - Optimized RLS policies on `email_logs` to cache auth function results
  - Removed duplicate SELECT policy from `email_logs` (kept the more efficient one)
  - Removed unused index on `error_logs`
  
  ## Security Notes
  
  - RLS policies now use subquery pattern for auth functions which caches results
  - Removed redundant policy to prevent multiple permissive policy issues
  - All tables remain properly secured with appropriate access controls
*/

-- Add missing indexes for foreign keys
CREATE INDEX IF NOT EXISTS idx_calendars_client_id ON public.calendars(client_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);

-- Remove unused index
DROP INDEX IF EXISTS idx_error_logs_user_id;

-- Fix email_logs RLS policies for better performance
-- Drop the duplicate and less efficient policies
DROP POLICY IF EXISTS "Users can view own email logs" ON public.email_logs;
DROP POLICY IF EXISTS "Users can read email logs sent to them" ON public.email_logs;
DROP POLICY IF EXISTS "System can insert email logs" ON public.email_logs;

-- Recreate optimized policies with subquery pattern for auth functions
-- Users can view email logs sent to their email address (using cached auth.uid())
CREATE POLICY "Users can view email logs sent to them"
  ON public.email_logs
  FOR SELECT
  TO authenticated
  USING (
    recipient IN (
      SELECT email FROM auth.users WHERE id = (select auth.uid())
    )
  );

-- System can insert email logs (optimized with subquery)
CREATE POLICY "System can insert email logs"
  ON public.email_logs
  FOR INSERT
  TO public
  WITH CHECK ((select auth.role()) = 'service_role');
