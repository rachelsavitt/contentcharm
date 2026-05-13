import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create a separate client for public share views that doesn't persist sessions
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

export interface Profile {
  id: string;
  email: string;
  subscription_tier: 'free' | 'premium';
  calendars_this_month: number;
  brand_name?: string;
  brand_logo_url?: string;
  brand_colors: {
    primary: string;
    secondary: string;
  };
  brand_fonts: {
    heading: string;
    body: string;
  };
  brand_voice?: string;
  niche?: string;
  target_audience?: string;
  business_goals?: string;
  location?: string;
  subscription_plan?: 'starter' | 'pro' | 'agency';
  billing_cycle?: 'monthly' | 'annual';
  subscription_status?: 'active' | 'canceled' | 'expired' | 'trial';
  subscription_price?: number;
  next_billing_date?: string;
  subscription_started_at?: string;
  subscription_canceled_at?: string;
  billing_email?: string;
  payment_method_last4?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  trial_ends_at?: string;
  payment_failed_at?: string;
  is_early_adopter?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Calendar {
  id: string;
  user_id: string;
  title: string;
  niche: string;
  audience: string;
  platforms: string[];
  time_period: number;
  goals?: string | null;
  tone?: string | null;
  website?: string | null;
  summary?: string | null;
  humanize_content: boolean;
  local_seo_enabled: boolean;
  location?: string | null;
  share_token?: string | null;
  cover_image_url?: string | null;
  client_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendarPost {
  id: string;
  calendar_id: string;
  day_number: number;
  platform: string;
  post_type?: string;
  title: string;
  hook?: string;
  caption?: string;
  hashtags?: string[];
  media_type?: 'image' | 'video';
  image_url?: string;
  video_url?: string;
  thumbnail_url?: string;
  scheduled_date?: string;
  optimal_time?: string;
  virality_score?: number;
  trend_tags?: string[];
  approval_status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  client_feedback?: string;
  created_at: string;
}