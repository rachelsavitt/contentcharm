/*
  # Fix Security and Performance Issues

  ## Changes Made

  1. **Add Missing Foreign Key Indexes**
     - Add index on `calendars.client_id` for better query performance
     - Add index on `clients.user_id` for better query performance

  2. **Optimize RLS Policies with SELECT subqueries**
     - Fix `stripe_customers` policy to use `(select auth.uid())`
     - Fix `stripe_subscriptions` policy to use `(select auth.uid())`
     - Fix `stripe_orders` policy to use `(select auth.uid())`
     - Fix `email_logs` policy to use `(select auth.uid())`
     - This prevents re-evaluation of auth functions for each row

  3. **Remove Unused Indexes**
     - Drop unused indexes on `error_logs` table
     - Drop unused indexes on `email_logs` table
     - Drop unused indexes on `profiles` table

  4. **Fix Overly Permissive RLS Policy**
     - The service role policy for email_logs is intentionally permissive
     - This is required for edge functions to log emails
*/

-- Add missing foreign key indexes
CREATE INDEX IF NOT EXISTS idx_calendars_client_id ON calendars(client_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- Drop and recreate RLS policies with optimized auth function calls

-- Fix stripe_customers RLS policy
DROP POLICY IF EXISTS "Users can view their own customer data" ON stripe_customers;
CREATE POLICY "Users can view their own customer data"
  ON stripe_customers
  FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()) AND deleted_at IS NULL);

-- Fix stripe_subscriptions RLS policy
DROP POLICY IF EXISTS "Users can view their own subscription data" ON stripe_subscriptions;
CREATE POLICY "Users can view their own subscription data"
  ON stripe_subscriptions
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id 
      FROM stripe_customers 
      WHERE user_id = (select auth.uid()) AND deleted_at IS NULL
    ) 
    AND deleted_at IS NULL
  );

-- Fix stripe_orders RLS policy
DROP POLICY IF EXISTS "Users can view their own order data" ON stripe_orders;
CREATE POLICY "Users can view their own order data"
  ON stripe_orders
  FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id 
      FROM stripe_customers 
      WHERE user_id = (select auth.uid()) AND deleted_at IS NULL
    ) 
    AND deleted_at IS NULL
  );

-- Fix email_logs RLS policy
DROP POLICY IF EXISTS "Users can read email logs sent to them" ON email_logs;
CREATE POLICY "Users can read email logs sent to them"
  ON email_logs
  FOR SELECT
  TO authenticated
  USING (
    recipient IN (
      SELECT email 
      FROM auth.users 
      WHERE id = (select auth.uid())
    )
  );

-- Drop unused indexes on error_logs
DROP INDEX IF EXISTS idx_error_logs_created_at;
DROP INDEX IF EXISTS idx_error_logs_error_type;
DROP INDEX IF EXISTS idx_error_logs_user_id;

-- Drop unused indexes on email_logs
DROP INDEX IF EXISTS idx_email_logs_sent_at;
DROP INDEX IF EXISTS idx_email_logs_email_type;
DROP INDEX IF EXISTS idx_email_logs_recipient;

-- Drop unused indexes on profiles
DROP INDEX IF EXISTS idx_profiles_stripe_customer_id;
DROP INDEX IF EXISTS idx_profiles_trial_ends_at;