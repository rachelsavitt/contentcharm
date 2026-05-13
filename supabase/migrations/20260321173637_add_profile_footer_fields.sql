/*
  # Add Profile Footer Fields

  This migration adds fields to the profiles table for displaying in client calendar footers.

  ## Changes
    - Add `full_name` column (text) - User's full name
    - Add `business_name` column (text) - Business name shown in calendar footer
    - Add `contact_email` column (text) - Contact email shown as clickable link in calendar footer
    - Add `website` column (text) - Website URL shown as clickable link in calendar footer

  ## Notes
    - All fields are optional (nullable) to maintain backward compatibility
    - No RLS changes needed as these are user profile fields
*/

-- Add new columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS business_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website text;