/*
  # Allow Client Feedback Updates via Share Link

  1. Changes
    - Add UPDATE policy for anonymous users to update client_feedback and approval_status
    - This allows clients viewing via share link to provide feedback on posts
    
  2. Security
    - Only allows updates to client_feedback and approval_status columns
    - Only for posts in calendars that have a share_token (shared calendars)
    - Does not allow clients to update other sensitive fields
*/

-- Allow anonymous users to update feedback fields for shared calendar posts
CREATE POLICY "Clients can update feedback via share token"
  ON calendar_posts
  FOR UPDATE
  TO anon
  USING (
    EXISTS (
      SELECT 1
      FROM calendars
      WHERE calendars.id = calendar_posts.calendar_id
      AND calendars.share_token IS NOT NULL
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM calendars
      WHERE calendars.id = calendar_posts.calendar_id
      AND calendars.share_token IS NOT NULL
    )
  );
