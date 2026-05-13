/*
  # Add is_archived column to clients table

  1. Changes
    - Add `is_archived` (boolean) column to `clients` table with default value of false
    
  2. Notes
    - Uses IF NOT EXISTS pattern to prevent errors if column already exists
    - Default value ensures existing records are not archived by default
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clients' AND column_name = 'is_archived'
  ) THEN
    ALTER TABLE clients ADD COLUMN is_archived boolean DEFAULT false;
  END IF;
END $$;