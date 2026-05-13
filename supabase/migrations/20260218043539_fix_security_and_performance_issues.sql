/*
  # Fix Security and Performance Issues

  ## Changes Made:
  
  ### 1. Add Missing Indexes for Foreign Keys
    - Add index on `calendars.client_id` for better join performance
    - Add index on `clients.user_id` for better join performance
  
  ### 2. Optimize RLS Policies (Auth Function Initialization)
    All RLS policies updated to use `(select auth.uid())` instead of `auth.uid()` directly.
    This prevents re-evaluation of auth functions for each row, significantly improving query performance.
    
    Tables affected:
    - `profiles` (3 policies)
    - `calendars` (4 policies)
    - `calendar_posts` (4 policies)
    - `clients` (4 policies)
  
  ### 3. Remove Unused Index
    - Drop `calendar_posts_day_number_idx` which is not being used
  
  ### 4. Fix Multiple Permissive Policies on Clients
    - Combine the two SELECT policies into a single policy that checks both conditions
    - This resolves the conflict between "Anyone can view client branding" and "Freelancers can view their own clients"
  
  ### Notes:
    - Auth DB Connection Strategy and Leaked Password Protection are configuration settings
      that need to be changed in the Supabase Dashboard, not via SQL migrations
*/

-- ============================================
-- 1. ADD MISSING INDEXES FOR FOREIGN KEYS
-- ============================================

-- Index for calendars.client_id foreign key
CREATE INDEX IF NOT EXISTS calendars_client_id_idx ON public.calendars(client_id);

-- Index for clients.user_id foreign key
CREATE INDEX IF NOT EXISTS clients_user_id_idx ON public.clients(user_id);

-- ============================================
-- 2. REMOVE UNUSED INDEX
-- ============================================

DROP INDEX IF EXISTS public.calendar_posts_day_number_idx;

-- ============================================
-- 3. OPTIMIZE RLS POLICIES - PROFILES TABLE
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Recreate with optimized auth function calls
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

-- ============================================
-- 4. OPTIMIZE RLS POLICIES - CALENDARS TABLE
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own calendars" ON public.calendars;
DROP POLICY IF EXISTS "Users can insert own calendars" ON public.calendars;
DROP POLICY IF EXISTS "Users can update own calendars" ON public.calendars;
DROP POLICY IF EXISTS "Users can delete own calendars" ON public.calendars;

-- Recreate with optimized auth function calls
CREATE POLICY "Users can view own calendars"
  ON public.calendars
  FOR SELECT
  TO authenticated
  USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own calendars"
  ON public.calendars
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own calendars"
  ON public.calendars
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own calendars"
  ON public.calendars
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);

-- ============================================
-- 5. OPTIMIZE RLS POLICIES - CALENDAR_POSTS TABLE
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own calendar posts" ON public.calendar_posts;
DROP POLICY IF EXISTS "Users can insert posts to own calendars" ON public.calendar_posts;
DROP POLICY IF EXISTS "Users can update posts in own calendars" ON public.calendar_posts;
DROP POLICY IF EXISTS "Users can delete posts from own calendars" ON public.calendar_posts;

-- Recreate with optimized auth function calls
CREATE POLICY "Users can view own calendar posts"
  ON public.calendar_posts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.calendars
      WHERE calendars.id = calendar_posts.calendar_id
      AND calendars.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can insert posts to own calendars"
  ON public.calendar_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.calendars
      WHERE calendars.id = calendar_posts.calendar_id
      AND calendars.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can update posts in own calendars"
  ON public.calendar_posts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.calendars
      WHERE calendars.id = calendar_posts.calendar_id
      AND calendars.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.calendars
      WHERE calendars.id = calendar_posts.calendar_id
      AND calendars.user_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can delete posts from own calendars"
  ON public.calendar_posts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.calendars
      WHERE calendars.id = calendar_posts.calendar_id
      AND calendars.user_id = (select auth.uid())
    )
  );

-- ============================================
-- 6. OPTIMIZE RLS POLICIES - CLIENTS TABLE
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view client branding" ON public.clients;
DROP POLICY IF EXISTS "Freelancers can view their own clients" ON public.clients;
DROP POLICY IF EXISTS "Freelancers can create clients" ON public.clients;
DROP POLICY IF EXISTS "Freelancers can update their own clients" ON public.clients;
DROP POLICY IF EXISTS "Freelancers can delete their own clients" ON public.clients;

-- Recreate with optimized auth function calls
-- Combine the two SELECT policies into one to fix the "Multiple Permissive Policies" issue
CREATE POLICY "Users can view clients"
  ON public.clients
  FOR SELECT
  TO authenticated
  USING (
    -- Users can view their own clients
    (select auth.uid()) = user_id
    -- OR anyone can view client branding (all clients are viewable for branding purposes)
    OR true
  );

CREATE POLICY "Freelancers can create clients"
  ON public.clients
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Freelancers can update their own clients"
  ON public.clients
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Freelancers can delete their own clients"
  ON public.clients
  FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id);
