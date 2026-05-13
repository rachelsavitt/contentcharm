/*
  # Add card_color field to calendar_posts

  1. Changes
    - Add `card_color` column to `calendar_posts` table
      - Stores custom color override for post pill cards
      - Nullable text field, defaults to null (auto/platform color)
      - When null, uses platform default color
      - When set, overrides platform color with custom value
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendar_posts' AND column_name = 'card_color'
  ) THEN
    ALTER TABLE calendar_posts ADD COLUMN card_color text;
  END IF;
END $$;