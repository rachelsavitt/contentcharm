/*
  # Add cover image support to calendars

  1. Changes to calendars table
    - Add `cover_image_url` column (text, nullable) - stores URL for uploaded cover image
    - This replaces/supplements automatic screenshot functionality
    - Allows users to manually upload and customize calendar cover images
  
  2. Notes
    - Cover images will be displayed prominently on calendar views
    - Supports standard image formats (JPEG, PNG, GIF)
    - Maintains backward compatibility - existing calendars without cover images will work normally
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendars' AND column_name = 'cover_image_url'
  ) THEN
    ALTER TABLE calendars ADD COLUMN cover_image_url text;
  END IF;
END $$;
