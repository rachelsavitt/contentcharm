/*
  # Add early adopter tracking

  1. Changes
    - Add `is_early_adopter` boolean field to profiles table
    - Default to false for existing users
    - New signups can be marked as early adopters during intro pricing period
  
  2. Notes
    - Early adopters lock in introductory pricing forever
    - Field is used to display special badge in the app
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_early_adopter'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_early_adopter boolean DEFAULT false;
  END IF;
END $$;