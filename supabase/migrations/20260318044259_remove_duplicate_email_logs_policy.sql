/*
  # Remove Duplicate Email Logs Policy

  1. Changes
    - Remove the old "Service role only can insert email logs" policy
    - This policy was causing performance issues by re-evaluating auth.jwt() for each row
    - The replacement policy "Service role can insert email logs" is already in place

  2. Security
    - Maintains existing security with better performance
    - No security downgrade, just removes the problematic duplicate policy
*/

-- Drop the old policy that re-evaluates auth.jwt() for each row
DROP POLICY IF EXISTS "Service role only can insert email logs" ON email_logs;
