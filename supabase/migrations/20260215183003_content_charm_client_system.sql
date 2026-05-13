/*
  # Content Charm - Client Management System

  1. New Tables
    - `clients`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles) - the freelancer who owns this client
      - `name` (text) - client business name
      - `email` (text) - client contact email
      - `brand_logo_url` (text, nullable) - URL to client's logo
      - `brand_colors` (jsonb) - client's brand colors (primary, secondary, accent)
      - `brand_fonts` (jsonb) - client's brand fonts (heading, body)
      - `notes` (text, nullable) - internal notes about the client
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes to Existing Tables
    - Add `client_id` to `calendars` table
    - Add `image_url` to `calendar_posts` table for uploaded graphics
    - Add `scheduled_date` to `calendar_posts` for actual posting dates

  3. Security
    - Enable RLS on `clients` table
    - Add policies for freelancers to manage their clients
    - Update calendar policies to check client ownership

  4. Storage Setup
    - Create storage bucket for post images
*/

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text,
  brand_logo_url text,
  brand_colors jsonb DEFAULT '{"primary": "#3B82F6", "secondary": "#8B5CF6", "accent": "#10B981"}'::jsonb,
  brand_fonts jsonb DEFAULT '{"heading": "Inter", "body": "Inter"}'::jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add client_id to calendars
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendars' AND column_name = 'client_id'
  ) THEN
    ALTER TABLE calendars ADD COLUMN client_id uuid REFERENCES clients(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add image_url to calendar_posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendar_posts' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE calendar_posts ADD COLUMN image_url text;
  END IF;
END $$;

-- Add scheduled_date to calendar_posts for actual posting dates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'calendar_posts' AND column_name = 'scheduled_date'
  ) THEN
    ALTER TABLE calendar_posts ADD COLUMN scheduled_date date;
  END IF;
END $$;

-- Enable RLS on clients table
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Policies for clients table
CREATE POLICY "Freelancers can view their own clients"
  ON clients FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Freelancers can create clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Freelancers can update their own clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Freelancers can delete their own clients"
  ON clients FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create storage bucket for post images
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for post images
CREATE POLICY "Authenticated users can upload post images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'post-images');

CREATE POLICY "Anyone can view post images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'post-images');

CREATE POLICY "Users can update their own post images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'post-images');

CREATE POLICY "Users can delete their own post images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'post-images');
