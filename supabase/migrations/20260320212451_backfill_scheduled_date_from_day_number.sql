/*
  # Backfill Scheduled Date from Day Number

  1. Changes
    - Updates all calendar_posts where scheduled_date is NULL but day_number is NOT NULL
    - Sets scheduled_date using the calendar's created_at month + day_number
    - Critical fix to ensure all posts display correctly on the calendar

  2. Notes
    - This fixes existing data where posts were created without scheduled_date
    - Future posts will have scheduled_date set via application code
*/

-- Backfill scheduled_date for posts that only have day_number
UPDATE calendar_posts
SET scheduled_date = (
  SELECT
    (date_trunc('month', calendars.created_at) +
    (calendar_posts.day_number - 1) * interval '1 day')::date
  FROM calendars
  WHERE calendars.id = calendar_posts.calendar_id
)
WHERE scheduled_date IS NULL
AND day_number IS NOT NULL;
