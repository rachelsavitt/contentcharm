/*
  # Add humanize_content field to calendars

  1. Changes
    - Add `humanize_content` boolean column to calendars table
    - Defaults to false
  
  2. Purpose
    - Allow users to opt-in to humanized content that avoids AI detection
    - When enabled, content will be written in a more natural, human-like style
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendars' AND column_name = 'humanize_content'
  ) THEN
    ALTER TABLE calendars ADD COLUMN humanize_content boolean DEFAULT false;
  END IF;
END $$;