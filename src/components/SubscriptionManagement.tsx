import { useState } from 'react';
import { Check, X, AlertCircle, CreditCard, Calendar, TrendingUp } from 'lucide-react';

interface SubscriptionManagementProps {
  currentPlan: string;
  billingCycle: string;
  subscriptionStatus: string;
  nextBillingDate?: string;
  onUpgrade: (plan: string, cycle: string) => Promise<void>;
  onCancel: () => Promise<void>;
}

const PLANS = {
  starter: {
    name: 'Starter',
    monthlyPrice: 9,
    annualPrice: 9,
    features: [
      'Up to 3 clients',
      'Shareable client approval links',
      'Client reactions and feedback',
      'Export approved posts',
      'Email support',
    ],
    limits: 'Perfect for freelancers just getting started',
    popular: false
  },
  pro: {
    name: 'Pro',
    monthlyPrice: 19,
    annualPrice: 19,
    features: [
      'Up to 6 clients',
      'Everything in Starter',
      'Priority email support',
      'Early adopter pricing locked forever',
    ],
    limits: 'For active freelancers managing multiple clients',
    popular: true
  },
  agency: {
    name: 'Agency',
    monthlyPrice: 39,
    annualPrice: 39,
    features: [
      'Unlimited clients',
      'Everything in Pro',
      '24hr priority support',
      'Early adopter pricing locked forever',
      'First access to new features',
    ],
    limits: 'For growing agencies with large client rosters',
    popular: false
  }
};

export function SubscriptionManagement({
  currentPlan,
  billingCycle,
  subscriptionStatus,
  nextBillingDate,
  onUpgrade,
  onCancel
}: SubscriptionManagementProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<'monthly' | 'annual'>(billingCycle as 'monthly' | 'annual');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    try {
      await onUpgrade(selectedPlan, selectedCycle);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await onCancel();
      setShowCancelModal(false);
    } catch (error) {
      console.error('Cancellation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSavings = (monthlyPrice: number, annualPrice: number) => {
    const monthlyCost = monthlyPrice * 12;
    const annualCost = annualPrice * 12;
    const savings = monthlyCost - annualCost;
    const percentage = Math.round((savings / monthlyCost) * 100);
    return { savings, percentage };
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#1a1a18] rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">
              Current Plan: {PLANS[currentPlan as keyof typeof PLANS]?.name || currentPlan}
            </h3>
            <p className="text-white/80">
              {billingCycle === 'annual' ? 'Annual' : 'Monthly'} billing
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-[#c8a84b]">
              ${PLANS[currentPlan as keyof typeof PLANS]?.[billingCycle === 'annual' ? 'annualPrice' : 'monthlyPrice']}
            </div>
            <div className="text-sm text-white/80">per month</div>
          </div>
        </div>
        {subscriptionStatus === 'canceled' && (
          <div className="mt-4 bg-yellow-500/20 border border-yellow-300 rounded-lg p-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <p className="text-sm">Your subscription has been canceled and will expire on {nextBillingDate}</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-4 bg-gray-100 rounded-lg p-4">
        <span className={`font-medium ${selectedCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
          Monthly
        </span>
        <button
          onClick={() => setSelectedCycle(selectedCycle === 'monthly' ? 'annual' : 'monthly')}
          className={`relative w-14 h-7 rounded-full transition-colors ${
            selectedCycle === 'annual' ? 'bg-blue-600' : 'bg-gray-400'
          }`}
        >
          <span
            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
              selectedCycle === 'annual' ? 'translate-x-7' : ''
            }`}
          />
        </button>
        <span className={`font-medium ${selectedCycle === 'annual' ? 'text-gray-900' : 'text-gray-500'}`}>
          Annual
        </span>
        {selectedCycle === 'annual' && (
          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">
            Save 25%
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(PLANS).map(([planKey, plan]) => {
          const isCurrentPlan = planKey === currentPlan && selectedCycle === billingCycle;
          const price = selectedCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;
          const savings = calculateSavings(plan.monthlyPrice, plan.annualPrice);

          const planTiers = ['starter', 'pro', 'agency'];
          const currentPlanIndex = planTiers.indexOf(currentPlan);
          const thisPlanIndex = planTiers.indexOf(planKey);

          let buttonText = 'Upgrade Now';
          if (thisPlanIndex < currentPlanIndex) {
            buttonText = 'Downgrade';
          } else if (thisPlanIndex > currentPlanIndex) {
            buttonText = 'Upgrade Now';
          }

          return (
            <div
              key={planKey}
              className={`relative rounded-xl border-2 p-6 transition-all ${
                plan.popular
                  ? 'border-blue-500 shadow-lg scale-105'
                  : isCurrentPlan
                  ? 'border-[#c8a84b] bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  MOST POPULAR
                </div>
              )}
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c8a84b] text-[#1a1a18] text-xs font-bold px-3 py-1 rounded-full">
                  CURRENT PLAN
                </div>
              )}

              <div className="text-center mb-6">
                <h4 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-4xl font-bold text-gray-900">${price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                {selectedCycle === 'annual' && (
                  <div className="text-sm space-y-1">
                    <p className="text-gray-500 line-through">${plan.monthlyPrice * 12}/year</p>
                    <p className="text-green-600 font-semibold">
                      Save ${savings.savings}/year ({savings.percentage}% off)
                    </p>
                  </div>
                )}
                <p className="text-sm text-gray-600 mt-2">{plan.limits}</p>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {isCurrentPlan ? (
                <button
                  disabled
                  className="w-full py-3 bg-[#f7f3ed] text-[#1a1a18] border border-[#ece6dc] rounded-lg font-semibold cursor-not-allowed"
                >
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectedPlan(planKey);
                    handleUpgrade();
                  }}
                  disabled={loading}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-[#1a1a18] text-white hover:bg-[#2a2a28]'
                      : 'bg-white text-[#1a1a18] border border-[#1a1a18] hover:bg-gray-50'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading && selectedPlan === planKey ? 'Processing...' : buttonText}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          Plan Comparison
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-yellow-200">
                <th className="text-left py-2 px-3 font-semibold text-gray-700">Feature</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700">Starter</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700">Pro</th>
                <th className="text-center py-2 px-3 font-semibold text-gray-700">Agency</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              <tr className="border-b border-yellow-100">
                <td className="py-2 px-3">Clients</td>
                <td className="text-center py-2 px-3">Up to 3</td>
                <td className="text-center py-2 px-3">Up to 6</td>
                <td className="text-center py-2 px-3">Unlimited</td>
              </tr>
              <tr className="border-b border-yellow-100">
                <td className="py-2 px-3">Client approval links</td>
                <td className="text-center py-2 px-3"><Check className="w-4 h-4 mx-auto text-green-500" /></td>
                <td className="text-center py-2 px-3"><Check className="w-4 h-4 mx-auto text-green-500" /></td>
                <td className="text-center py-2 px-3"><Check className="w-4 h-4 mx-auto text-green-500" /></td>
              </tr>
              <tr className="border-b border-yellow-100">
                <td className="py-2 px-3">Client reactions & feedback</td>
                <td className="text-center py-2 px-3"><Check className="w-4 h-4 mx-auto text-green-500" /></td>
                <td className="text-center py-2 px-3"><Check className="w-4 h-4 mx-auto text-green-500" /></td>
                <td className="text-center py-2 px-3"><Check className="w-4 h-4 mx-auto text-green-500" /></td>
              </tr>
              <tr className="border-b border-yellow-100">
                <td className="py-2 px-3">Export posts</td>
                <td className="text-center py-2 px-3"><Check className="w-4 h-4 mx-auto text-green-500" /></td>
                <td className="text-center py-2 px-3"><Check className="w-4 h-4 mx-auto text-green-500" /></td>
                <td className="text-center py-2 px-3"><Check className="w-4 h-4 mx-auto text-green-500" /></td>
              </tr>
              <tr className="border-b border-yellow-100">
                <td className="py-2 px-3">Support</td>
                <td className="text-center py-2 px-3">Email</td>
                <td className="text-center py-2 px-3">Priority email</td>
                <td className="text-center py-2 px-3">24hr priority</td>
              </tr>
              <tr className="border-b border-yellow-100">
                <td className="py-2 px-3">Early adopter pricing</td>
                <td className="text-center py-2 px-3"><X className="w-4 h-4 mx-auto text-red-500" /></td>
                <td className="text-center py-2 px-3"><Check className="w-4 h-4 mx-auto text-green-500" /></td>
                <td className="text-center py-2 px-3"><Check className="w-4 h-4 mx-auto text-green-500" /></td>
              </tr>
              <tr>
                <td className="py-2 px-3">First access to new features</td>
                <td className="text-center py-2 px-3"><X className="w-4 h-4 mx-auto text-red-500" /></td>
                <td className="text-center py-2 px-3"><X className="w-4 h-4 mx-auto text-red-500" /></td>
                <td className="text-center py-2 px-3"><Check className="w-4 h-4 mx-auto text-green-500" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {subscriptionStatus === 'active' && (
        <div className="border-t border-gray-200 pt-6">
          <button
            onClick={() => setShowCancelModal(true)}
            className="text-red-600 hover:text-red-700 font-medium text-sm flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel Subscription
          </button>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Cancel Subscription?
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Are you sure you want to cancel your subscription? You'll lose access to:
                </p>
                <ul className="space-y-2 text-sm text-gray-700 mb-4">
                  <li className="flex items-center gap-2">
                    <X className="w-4 h-4 text-red-500" />
                    All premium features
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="w-4 h-4 text-red-500" />
                    Client management tools
                  </li>
                  <li className="flex items-center gap-2">
                    <X className="w-4 h-4 text-red-500" />
                    Priority support
                  </li>
                </ul>
                <p className="text-xs text-gray-500">
                  Your subscription will remain active until {nextBillingDate}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Canceling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
