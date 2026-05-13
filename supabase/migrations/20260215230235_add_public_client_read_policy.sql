/*
  # Add Public Read Access for Client Branding

  1. Changes
    - Add policy to allow public (unauthenticated) users to read client branding data
    - This is necessary for the share view to display client branding
    - Only SELECT is allowed for public users

  2. Security Considerations
    - Client branding information (logo, colors, fonts, name) is considered semi-public
    - This data is already visible when a calendar is shared via share token
    - No sensitive information (email, notes, user_id) is exposed in the UI
*/

-- Drop existing policy if it exists (for idempotency)
DROP POLICY IF EXISTS "Anyone can view client branding" ON clients;

-- Allow anyone to read client data (needed for share view)
CREATE POLICY "Anyone can view client branding"
  ON clients FOR SELECT
  TO public
  USING (true);
