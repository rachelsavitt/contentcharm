/*
  # Add onboarding_completed field to profiles

  1. Changes
    - Add `onboarding_completed` boolean field to `profiles` table
    - Default value is `false` so new users see the onboarding tour
    - Existing users will have the field set to `false` initially

  2. Notes
    - This field tracks whether a user has completed or dismissed the onboarding tour
    - Once set to `true`, the tour will not show again on subsequent logins
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'onboarding_completed'
  ) THEN
    ALTER TABLE profiles ADD COLUMN onboarding_completed boolean DEFAULT false;
  END IF;
END $$;