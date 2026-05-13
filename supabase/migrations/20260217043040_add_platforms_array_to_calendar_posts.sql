/*
  # Add multi-platform support to calendar posts

  1. Changes to calendar_posts table
    - Add `platforms` column (text array) - stores selected platforms for each post (e.g., ['Instagram', 'Facebook', 'LinkedIn'])
    - Defaults to empty array to maintain backward compatibility
    - Existing `platform` column will remain for backward compatibility but new posts should use `platforms` array
  
  2. Notes
    - This allows content creators to select which platforms each post should be published to
    - Posts can be cross-posted to multiple platforms or targeted to specific platforms
    - Maintains backward compatibility with existing posts that use the singular `platform` column
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendar_posts' AND column_name = 'platforms'
  ) THEN
    ALTER TABLE calendar_posts ADD COLUMN platforms text[] DEFAULT '{}';
  END IF;
END $$;
