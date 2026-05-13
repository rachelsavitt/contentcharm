/*
  # Remove SEO Keywords from Posts Table

  1. Changes
    - Remove `seo_keywords` column from `posts` table
    - This field was too generic and not useful for content strategy
  
  2. Notes
    - Using IF EXISTS to prevent errors if column doesn't exist
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'seo_keywords'
  ) THEN
    ALTER TABLE posts DROP COLUMN seo_keywords;
  END IF;
END $$;