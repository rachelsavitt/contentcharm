/*
  # Fix Security Issues

  This migration addresses the following security and performance concerns:

  1. Database Optimization
    - Remove unused index `calendars_client_id_idx` (not being utilized in queries)
    - Remove unused index `clients_user_id_idx` (not being utilized in queries)
    - These indexes consume storage and slow down write operations without providing benefit

  2. Security Enhancements
    - Note: Auth DB connection strategy and leaked password protection must be configured
      via Supabase Dashboard settings, not via SQL migrations
    - These settings are found in:
      - Project Settings > Database > Connection pooling mode
      - Authentication > Providers > Email > Password Protection

  ## Important Notes
  - Index removal will slightly improve write performance on calendars and clients tables
  - Connection strategy should be changed to percentage-based in Supabase Dashboard
  - Leaked password protection should be enabled in Auth settings in Supabase Dashboard
*/

-- Remove unused indexes to improve write performance
DROP INDEX IF EXISTS calendars_client_id_idx;
DROP INDEX IF EXISTS clients_user_id_idx;
