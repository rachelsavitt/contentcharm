/*
  # Allow anonymous access to client data for shared calendars

  1. Changes
    - Add policy to allow anonymous users to SELECT client data when viewing shared calendars
    - This enables clients to see branding (logo, colors) on their approval pages

  2. Security
    - Anonymous users can only read client data
    - Access is restricted to clients that have calendars with valid share_tokens
    - No write access for anonymous users
*/

-- Allow anonymous users to read client data for shared calendars
DROP POLICY IF EXISTS "Allow anon read of clients via shared calendars" ON public.clients;

CREATE POLICY "Allow anon read of clients via shared calendars"
  ON public.clients
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.calendars
      WHERE calendars.client_id = clients.id
      AND calendars.share_token IS NOT NULL
    )
  );