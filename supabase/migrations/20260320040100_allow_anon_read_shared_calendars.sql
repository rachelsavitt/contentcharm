/*
  # Allow anonymous access to shared calendars and posts

  1. Changes
    - Add policy to allow anonymous users to SELECT calendars by share_token
    - Add policy to allow anonymous users to SELECT posts from shared calendars
    - This enables clients to view their shared calendar approval pages

  2. Security
    - Anonymous users can only read calendars and posts
    - Access is restricted to calendars with a valid share_token
    - No write access for anonymous users
*/

-- Allow anonymous users to read shared calendars by share_token
DROP POLICY IF EXISTS "Allow anon read of shared calendars" ON public.calendars;

CREATE POLICY "Allow anon read of shared calendars"
  ON public.calendars
  FOR SELECT
  TO anon
  USING (share_token IS NOT NULL);

-- Allow anonymous users to read posts from shared calendars
DROP POLICY IF EXISTS "Allow anon read of shared calendar posts" ON public.calendar_posts;

CREATE POLICY "Allow anon read of shared calendar posts"
  ON public.calendar_posts
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.calendars
      WHERE calendars.id = calendar_posts.calendar_id
      AND calendars.share_token IS NOT NULL
    )
  );