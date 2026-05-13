import React, { useState } from 'react';
import { Check, CreditCard, X } from 'lucide-react';
import { stripeProducts } from '../stripe-config';
import { useAuth } from '../hooks/useAuth';
import { useSubscription } from '../hooks/useSubscription';
import { createCheckoutSession } from '../lib/stripe';

export function PricingPage() {
  const { user } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      window.location.href = '/login';
      return;
    }

    setLoadingPlan(priceId);
    try {
      const { url } = await createCheckoutSession({
        priceId,
        mode: 'subscription',
        successUrl: `${window.location.origin}/success`,
        cancelUrl: window.location.href,
      });

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setLoadingPlan(null);
    }
  };

  const getCurrentPlan = () => {
    if (!subscription || subscriptionLoading) return null;

    const currentProduct = stripeProducts.find(
      product => product.priceId === subscription.price_id
    );

    return currentProduct?.name || null;
  };

  const currentPlan = getCurrentPlan();

  const getPrice = (planName: string) => {
    const prices: { [key: string]: number } = {
      Starter: 9,
      Pro: 19,
      Agency: 39,
    };
    return prices[planName] || 0;
  };

  const getRegularPrice = (planName: string) => {
    const prices: { [key: string]: number } = {
      Starter: 29,
      Pro: 59,
      Agency: 99,
    };
    return prices[planName] || 0;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose Your Plan
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Simple pricing that grows with you. Lock in today's rate forever.
          </p>
        </div>

        <div className="mt-12 max-w-3xl mx-auto mb-8">
          <div className="bg-[#1a1a18] border border-[#1a1a18] rounded-xl p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'DM Serif Display, serif' }}>
              🎉 Introductory Pricing
            </h3>
            <p className="text-sm text-white/80">
              We're new and our prices reflect that. Lock in <span className="text-[#c8a84b] font-bold">today's rate forever</span> — your price will never increase as long as you stay subscribed. Rates will rise as we grow.
            </p>
          </div>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0">
          {stripeProducts.map((product) => {
            const isCurrentPlan = currentPlan === product.name;
            const isLoading = loadingPlan === product.priceId;
            const displayPrice = getPrice(product.name);
            const regularPrice = getRegularPrice(product.name);

            return (
              <div
                key={product.priceId}
                className={`bg-white border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 ${
                  product.name === 'Pro' ? 'border-[#1A1612] relative' : ''
                }`}
              >
                {product.name === 'Pro' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#1A1612] text-white px-4 py-1 text-sm font-medium rounded-full">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {product.name}
                  </h3>
                  <p className="mt-4 text-sm text-gray-500">
                    {getTagline(product.name)}
                  </p>
                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900">
                      ${displayPrice}
                    </span>
                    <span className="text-base font-medium text-gray-500">
                      /mo
                    </span>
                  </p>
                  <p className="mt-2 text-xs text-[#8C8479]">
                    Regular price ${regularPrice}/mo — lock in today's rate forever
                  </p>

                  <button
                    onClick={() => handleSubscribe(product.priceId)}
                    disabled={isCurrentPlan || isLoading || !user}
                    className={`mt-8 block w-full rounded-md py-2 text-sm font-semibold text-center transition-colors ${
                      isCurrentPlan
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed border border-gray-200'
                        : product.name === 'Pro'
                        ? 'bg-[#1A1612] text-white hover:bg-black border-none'
                        : 'bg-white text-[#1A1612] hover:bg-gray-50 border border-[#1A1612]'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </div>
                    ) : isCurrentPlan ? (
                      'Current Plan'
                    ) : !user ? (
                      'Sign In to Subscribe'
                    ) : (
                      'Lock In This Price →'
                    )}
                  </button>
                </div>

                <div className="pt-6 pb-8 px-6">
                  <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">
                    What's included
                  </h4>
                  <ul className="mt-6 space-y-4">
                    {getFeatures(product.name).map((feature) => (
                      <li key={feature} className="flex space-x-3">
                        <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                        <span className="text-sm text-gray-500">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Compare Plans
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b">
                    Starter<br />
                    <span className="text-lg font-bold">$9/mo</span>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b">
                    Pro<br />
                    <span className="text-lg font-bold">$19/mo</span>
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 border-b">
                    Agency<br />
                    <span className="text-lg font-bold">$39/mo</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Clients</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">Up to 3</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">Up to 6</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">Unlimited</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Client approval links</td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Client reactions & feedback</td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Export posts</td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Support</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">Email</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">Priority email</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">24hr priority</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">Early adopter pricing</td>
                  <td className="px-6 py-4 text-center">
                    <X className="h-5 w-5 text-gray-400 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-900">First access to new features</td>
                  <td className="px-6 py-4 text-center">
                    <X className="h-5 w-5 text-gray-400 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <X className="h-5 w-5 text-gray-400 mx-auto" />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Check className="h-5 w-5 text-green-500 mx-auto" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-center text-sm text-[#8C8479] mt-6">
            Prices shown are introductory rates. Lock in today and your price never changes.
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          All plans include a 14-day free trial. Cancel anytime. No contracts.
        </p>
      </div>
    </div>
  );
}

function getTagline(planName: string): string {
  const taglines: { [key: string]: string } = {
    Starter: "Perfect for freelancers just getting started",
    Pro: "For active freelancers managing multiple clients",
    Agency: "For growing agencies with large client rosters",
  };
  return taglines[planName] || "";
}

function getFeatures(planName: string): string[] {
  const features: { [key: string]: string[] } = {
    Starter: [
      'Up to 3 clients',
      'Shareable client approval links',
      'Client reactions and feedback',
      'Export approved posts',
      'Email support',
    ],
    Pro: [
      'Up to 6 clients',
      'Everything in Starter',
      'Priority email support',
      'Early adopter pricing locked forever',
    ],
    Agency: [
      'Unlimited clients',
      'Everything in Pro',
      '24hr priority support',
      'Early adopter pricing locked forever',
      'First access to new features',
    ],
  };

  return features[planName] || [];
}