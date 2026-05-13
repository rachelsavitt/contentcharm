/*
  # Add Thumbnail URL to Calendar Posts

  1. Changes
    - Add `thumbnail_url` column to `calendar_posts` table
    - This stores a cover image/thumbnail for video posts (reels)
    - Allows displaying a static image in calendar views while keeping the video playable in detail view

  2. Notes
    - Field is optional and nullable
    - Primary use case is for video posts to show a preview image
    - Image posts can optionally use this for a different thumbnail representation
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendar_posts' AND column_name = 'thumbnail_url'
  ) THEN
    ALTER TABLE calendar_posts ADD COLUMN thumbnail_url text;
  END IF;
END $$;
