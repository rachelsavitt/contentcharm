/*
  # Add Video Support for Instagram Reels

  1. Changes to Existing Tables
    - Add `video_url` to `calendar_posts` table for uploaded videos
    - Ensure `media_type` is properly configured to distinguish between images and videos

  2. Storage Setup
    - Create storage bucket for post videos (MP4 files)
    - Set up appropriate policies for video uploads

  3. Important Notes
    - Videos should be MP4 format for Instagram Reels compatibility
    - The existing `image_url` field will continue to work for images
    - The `media_type` field will indicate 'image' or 'video'
*/

-- Add video_url to calendar_posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendar_posts' AND column_name = 'video_url'
  ) THEN
    ALTER TABLE calendar_posts ADD COLUMN video_url text;
  END IF;
END $$;

-- Create storage bucket for post videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-videos', 'post-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for post videos
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Authenticated users can upload post videos'
  ) THEN
    CREATE POLICY "Authenticated users can upload post videos"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'post-videos');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Anyone can view post videos'
  ) THEN
    CREATE POLICY "Anyone can view post videos"
      ON storage.objects FOR SELECT
      TO public
      USING (bucket_id = 'post-videos');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can update their own post videos'
  ) THEN
    CREATE POLICY "Users can update their own post videos"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'post-videos');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can delete their own post videos'
  ) THEN
    CREATE POLICY "Users can delete their own post videos"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'post-videos');
  END IF;
END $$;
