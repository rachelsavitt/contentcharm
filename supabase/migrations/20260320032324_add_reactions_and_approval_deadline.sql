/*
  # Add Reactions and Approval Deadline Fields

  1. Changes to calendars table
    - Add `approval_deadline` (date, nullable) - Deadline for client to approve all posts

  2. Changes to calendar_posts table
    - Add `reactions` (jsonb, nullable) - Array of emoji reactions from client
      Format: [{"emoji": "❤️", "count": 1}, {"emoji": "🔥", "count": 1}]

  3. Notes
    - approval_deadline is optional and can be set by freelancers
    - reactions will be displayed to both client and freelancer
    - All fields default to null
*/

-- Add approval_deadline to calendars table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendars' AND column_name = 'approval_deadline'
  ) THEN
    ALTER TABLE calendars ADD COLUMN approval_deadline date;
  END IF;
END $$;

-- Add reactions to calendar_posts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendar_posts' AND column_name = 'reactions'
  ) THEN
    ALTER TABLE calendar_posts ADD COLUMN reactions jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;
