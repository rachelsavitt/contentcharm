/*
  # Add website and summary fields to calendars

  1. Changes
    - Add `website` column to store the user's website URL for AI reference
    - Add `summary` column to store a description of what the calendar should include
  
  2. Details
    - Both fields are optional (nullable)
    - website: text field for URL
    - summary: text field for longer descriptions
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendars' AND column_name = 'website'
  ) THEN
    ALTER TABLE calendars ADD COLUMN website text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendars' AND column_name = 'summary'
  ) THEN
    ALTER TABLE calendars ADD COLUMN summary text;
  END IF;
END $$;