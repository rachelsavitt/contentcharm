import { supabase } from './supabase';

interface CreateCheckoutSessionParams {
  priceId: string;
  mode: 'subscription' | 'payment';
  successUrl: string;
  cancelUrl: string;
}

export async function createCheckoutSession({
  priceId,
  mode,
  successUrl,
  cancelUrl,
}: CreateCheckoutSessionParams) {
  let { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
    if (!refreshedSession?.access_token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    session = refreshedSession;
  }

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      price_id: priceId,
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Stripe checkout error response:', response.status, errorText);
    let errorMessage = 'Failed to create checkout session';
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.error || errorMessage;
    } catch {}
    throw new Error(`${response.status}: ${errorMessage}`);
  }

  return response.json();
}