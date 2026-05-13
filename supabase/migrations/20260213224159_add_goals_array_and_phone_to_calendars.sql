/*
  # Update calendars table for goals and phone number

  1. Changes
    - Change `goals` column from text to text[] (array of text)
    - Add `phone_number` column for contact CTAs
  
  2. Notes
    - Existing goals data will be preserved and converted to single-item arrays
    - Phone number is optional for businesses that want call-based CTAs
*/

-- Add phone_number column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendars' AND column_name = 'phone_number'
  ) THEN
    ALTER TABLE calendars ADD COLUMN phone_number text;
  END IF;
END $$;

-- Convert goals from text to text[]
DO $$
BEGIN
  -- Check if goals column is currently text type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendars' 
    AND column_name = 'goals' 
    AND data_type = 'text'
  ) THEN
    -- Create a temporary column
    ALTER TABLE calendars ADD COLUMN goals_temp text[];
    
    -- Copy existing data, converting text to array
    UPDATE calendars 
    SET goals_temp = CASE 
      WHEN goals IS NOT NULL AND goals != '' THEN ARRAY[goals]
      ELSE ARRAY[]::text[]
    END;
    
    -- Drop old column and rename new one
    ALTER TABLE calendars DROP COLUMN goals;
    ALTER TABLE calendars RENAME COLUMN goals_temp TO goals;
    
    -- Set default for new column
    ALTER TABLE calendars ALTER COLUMN goals SET DEFAULT ARRAY[]::text[];
  END IF;
END $$;