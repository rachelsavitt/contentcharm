/*
  # Add Structured Strategic Fields to Calendars

  1. Changes
    - Add `product_service` field for core offering description
    - Add `core_problem` field for specific problem solved
    - Add `unique_differentiator` field for competitive advantage
    - Add `audience_details` field for detailed audience information
    - Add `fears_misunderstandings` field for psychological triggers
    - Add `desired_outcome` field for audience aspirations
    - Keep existing `summary` field for backward compatibility

  2. Notes
    - All new fields are nullable for backward compatibility
    - These fields enable direct strategic context extraction without parsing
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendars' AND column_name = 'product_service'
  ) THEN
    ALTER TABLE calendars ADD COLUMN product_service text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendars' AND column_name = 'core_problem'
  ) THEN
    ALTER TABLE calendars ADD COLUMN core_problem text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendars' AND column_name = 'unique_differentiator'
  ) THEN
    ALTER TABLE calendars ADD COLUMN unique_differentiator text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendars' AND column_name = 'audience_details'
  ) THEN
    ALTER TABLE calendars ADD COLUMN audience_details text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendars' AND column_name = 'fears_misunderstandings'
  ) THEN
    ALTER TABLE calendars ADD COLUMN fears_misunderstandings text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendars' AND column_name = 'desired_outcome'
  ) THEN
    ALTER TABLE calendars ADD COLUMN desired_outcome text;
  END IF;
END $$;