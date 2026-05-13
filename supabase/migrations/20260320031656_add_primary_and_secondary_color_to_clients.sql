/*
  # Add Primary and Secondary Color Fields to Clients

  1. Changes
    - Add `primary_color` (text, nullable) - Client's primary brand color (hex code)
    - Add `secondary_color` (text, nullable) - Client's secondary brand color (hex code)
    - Add `logo_url` (text, nullable) - Alias for brand_logo_url for consistency

  2. Notes
    - These fields will be used to personalize the client-facing approval page
    - If null, the system will fall back to Content Charm default colors
    - The existing `brand_colors` JSONB field will remain for backward compatibility
*/

-- Add primary_color field to clients table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'primary_color'
  ) THEN
    ALTER TABLE clients ADD COLUMN primary_color text;
  END IF;
END $$;

-- Add secondary_color field to clients table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'secondary_color'
  ) THEN
    ALTER TABLE clients ADD COLUMN secondary_color text;
  END IF;
END $$;

-- Add logo_url field as alias (for consistency with naming)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE clients ADD COLUMN logo_url text;
  END IF;
END $$;
