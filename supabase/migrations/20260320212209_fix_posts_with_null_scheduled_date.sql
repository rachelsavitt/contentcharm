/*
  # Fix Posts with Null Scheduled Date

  1. Changes
    - Updates all calendar_posts where scheduled_date is NULL but day_number is NOT NULL
    - Sets scheduled_date based on the calendar's created_at month + day_number
    - Ensures all posts have a valid scheduled_date for proper calendar display

  2. Notes
    - This is a data migration to fix existing posts
    - New posts will be created with scheduled_date set (via application code)
    - Uses calendar's created_at to determine the month
*/

-- Update posts with null scheduled_date by using calendar's created month + day_number
UPDATE calendar_posts cp
SET scheduled_date = (
  SELECT
    (date_trunc('month', c.created_at)::date + (cp.day_number - 1))::date
  FROM calendars c
  WHERE c.id = cp.calendar_id
)
WHERE cp.scheduled_date IS NULL
AND cp.day_number IS NOT NULL
AND cp.day_number > 0;
