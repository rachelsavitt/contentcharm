/*
  # Add Secondary Logo Field to Clients Table

  1. Changes
    - Add `mockup_logo_url` column to `clients` table for secondary logo used in mockups
    - This allows clients to have a separate logo optimized for mockup displays
    - The field is optional and nullable

  2. Notes
    - Primary `brand_logo_url` remains for general branding
    - New `mockup_logo_url` is specifically for social media mockups
    - No data migration needed as this is a new optional field
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'mockup_logo_url'
  ) THEN
    ALTER TABLE clients ADD COLUMN mockup_logo_url text;
  END IF;
END $$;
