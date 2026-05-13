/*
  # Add Subscription and Billing Management Fields

  This migration adds comprehensive subscription management capabilities to the profiles table.

  1. **New Fields Added to profiles table**
     - `subscription_plan` (text): Current subscription plan (starter/pro/agency)
     - `billing_cycle` (text): Billing frequency (monthly/annual)
     - `subscription_status` (text): Status of subscription (active/canceled/expired)
     - `subscription_price` (numeric): Current subscription price in dollars
     - `next_billing_date` (date): Date of next billing cycle
     - `subscription_started_at` (timestamptz): When subscription began
     - `subscription_canceled_at` (timestamptz): When subscription was canceled (if applicable)
     - `billing_email` (text): Email for billing notifications
     - `payment_method_last4` (text): Last 4 digits of payment method (for display)

  2. **Default Values**
     - New users default to 'starter' plan with 'monthly' billing
     - Subscription status defaults to 'active'
     - Subscription started date defaults to account creation date

  3. **Security**
     - Users can view their own subscription information
     - Users can update their billing email and subscription preferences
     - Payment information is stored securely (only last 4 digits visible)

  ## Notes
  - Actual payment processing should be handled by Stripe or similar service
  - This schema supports the business model with 3 tiers: Starter, Pro, Agency
  - Annual billing offers 25% discount off monthly pricing
*/

-- Add subscription and billing fields to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_plan'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_plan text DEFAULT 'starter';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'billing_cycle'
  ) THEN
    ALTER TABLE profiles ADD COLUMN billing_cycle text DEFAULT 'monthly';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_status text DEFAULT 'active';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_price'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_price numeric(10,2) DEFAULT 29.00;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'next_billing_date'
  ) THEN
    ALTER TABLE profiles ADD COLUMN next_billing_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_started_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_started_at timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'subscription_canceled_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN subscription_canceled_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'billing_email'
  ) THEN
    ALTER TABLE profiles ADD COLUMN billing_email text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'payment_method_last4'
  ) THEN
    ALTER TABLE profiles ADD COLUMN payment_method_last4 text;
  END IF;
END $$;

-- Create check constraint for valid subscription plans
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_subscription_plan_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_plan_check 
      CHECK (subscription_plan IN ('starter', 'pro', 'agency'));
  END IF;
END $$;

-- Create check constraint for valid billing cycles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_billing_cycle_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_billing_cycle_check 
      CHECK (billing_cycle IN ('monthly', 'annual'));
  END IF;
END $$;

-- Create check constraint for valid subscription statuses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_subscription_status_check'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_subscription_status_check 
      CHECK (subscription_status IN ('active', 'canceled', 'expired', 'trial'));
  END IF;
END $$;

-- Update existing RLS policies remain unchanged (users can read/update their own data)
