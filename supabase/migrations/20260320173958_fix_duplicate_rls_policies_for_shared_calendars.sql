/*
  # Fix duplicate RLS policies for shared calendars

  1. Changes
    - Remove duplicate policies for calendars table (keeping the more recent one)
    - Remove duplicate policies for calendar_posts table (keeping the more recent one)
    - Ensure clean, non-conflicting policy set for anonymous access

  2. Security
    - Maintains anonymous read access to shared calendars via share_token
    - Maintains anonymous read access to posts in shared calendars
    - Maintains anonymous update access for client feedback
    - All existing authenticated user policies remain unchanged
*/

-- Clean up duplicate calendar policies (keep the newer "Allow anon read of shared calendars")
DROP POLICY IF EXISTS "Public can view calendars with share token" ON public.calendars;

-- Clean up duplicate calendar_posts policies (keep the newer "Allow anon read of shared calendar posts")
DROP POLICY IF EXISTS "Public can view posts via share token" ON public.calendar_posts;
