import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Save, User, Mail, Calendar, CreditCard, Shield, Key, Eye, EyeOff, Upload } from 'lucide-react';
import { SubscriptionManagement } from './SubscriptionManagement';

interface ProfileProps {
  initialTab?: 'account' | 'subscription';
}

export function Profile({ initialTab = 'account' }: ProfileProps) {
  const { profile, refreshProfile, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'account' | 'subscription'>(initialTab);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    billing_email: '',
    full_name: '',
    business_name: '',
    contact_email: '',
    website: '',
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (profile) {
      setFormData({
        billing_email: profile.billing_email || profile.email || '',
        full_name: (profile as any).full_name || '',
        business_name: (profile as any).business_name || '',
        contact_email: (profile as any).contact_email || '',
        website: (profile as any).website || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          billing_email: formData.billing_email,
          full_name: formData.full_name,
          business_name: formData.business_name,
          contact_email: formData.contact_email,
          website: formData.website,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile!.id);

      if (error) throw error;

      await refreshProfile();
      setToast({ message: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      console.error('Error updating profile:', error);
      setToast({ message: 'Failed to update profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setToast({ message: 'Passwords do not match', type: 'error' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setToast({ message: 'Password must be at least 8 characters', type: 'error' });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      setToast({ message: 'Password updated successfully!', type: 'success' });
      setShowPasswordChange(false);
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error updating password:', error);
      setToast({ message: 'Failed to update password', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan: string, cycle: string) => {
    setLoading(true);
    try {
      const { stripeProducts } = await import('../stripe-config');
      const { createCheckoutSession } = await import('../lib/stripe');

      const product = stripeProducts.find(p => p.name.toLowerCase() === plan.toLowerCase());
      if (!product) throw new Error('Plan not found');

      const session = await createCheckoutSession({
        priceId: product.priceId,
        mode: 'subscription',
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/profile`,
      });

      if (session?.url) {
        window.location.href = session.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      setToast({ message: `Checkout error: ${error instanceof Error ? error.message : String(error)}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'canceled',
          subscription_canceled_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile!.id);

      if (error) throw error;

      await refreshProfile();
      setToast({ message: 'Subscription canceled successfully', type: 'success' });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      setToast({ message: 'Failed to cancel subscription', type: 'error' });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setToast({ message: 'Please select an image file', type: 'error' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: 'Image must be less than 5MB', type: 'error' });
      return;
    }

    setUploadingPhoto(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile!.id);

      if (updateError) throw updateError;

      await refreshProfile();
      setToast({ message: 'Photo uploaded successfully!', type: 'success' });
    } catch (error) {
      console.error('Error uploading photo:', error);
      setToast({ message: 'Failed to upload photo', type: 'error' });
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
        <p className="text-gray-600">Manage your account information and subscription</p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('account')}
          className={`pb-4 px-2 font-medium transition-colors relative ${
            activeTab === 'account'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Account Information
          </div>
          {activeTab === 'account' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('subscription')}
          className={`pb-4 px-2 font-medium transition-colors relative ${
            activeTab === 'subscription'
              ? 'text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Subscription
          </div>
          {activeTab === 'subscription' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          )}
        </button>
      </div>

      {activeTab === 'account' ? (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-2xl text-[#1A1612] mb-1" style={{ fontFamily: 'DM Serif Display, serif' }}>
              Your Profile
            </h2>
            <p className="text-[#8C8479] text-sm mb-6">This info appears in the footer of your client-facing calendars</p>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-[10px] font-semibold text-[#8C8479] uppercase tracking-wider mb-3">
                  Profile Photo
                </label>
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center justify-center overflow-hidden flex-shrink-0"
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      backgroundColor: '#eeedfe',
                      color: '#3c3489',
                    }}
                  >
                    {(profile as any)?.avatar_url ? (
                      <img
                        src={(profile as any).avatar_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold">
                        {getInitials(formData.full_name) || 'SR'}
                      </span>
                    )}
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="px-4 py-2 bg-white border border-[#E8E3DC] text-[#1A1612] rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
                    >
                      <Upload className="w-4 h-4" />
                      {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                    </button>
                    <p className="text-xs text-[#8C8479] mt-1.5">
                      Shown in your client calendar footer
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#8C8479] uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-[#E8E3DC] rounded-lg text-sm focus:ring-2 focus:ring-[#C9A96E] focus:border-transparent"
                  placeholder="e.g., Sarah Reynolds"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#8C8479] uppercase tracking-wider mb-2">
                  Business Name
                </label>
                <input
                  type="text"
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-[#c8a84b] rounded-lg text-sm focus:ring-2 focus:ring-[#C9A96E] focus:border-[#c8a84b]"
                  placeholder="e.g., Sarah Reynolds Creative"
                />
                <p className="text-xs text-[#8C8479] mt-1.5">
                  Shown in your client calendar footer
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#8C8479] uppercase tracking-wider mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-[#c8a84b] rounded-lg text-sm focus:ring-2 focus:ring-[#C9A96E] focus:border-[#c8a84b]"
                  placeholder="e.g., hello@sarahreynolds.co"
                />
                <p className="text-xs text-[#8C8479] mt-1.5">
                  Shown as a clickable link in your client calendar footer
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#8C8479] uppercase tracking-wider mb-2">
                  Website
                </label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-[#c8a84b] rounded-lg text-sm focus:ring-2 focus:ring-[#C9A96E] focus:border-[#c8a84b]"
                  placeholder="e.g., sarahreynolds.co"
                />
                <p className="text-xs text-[#8C8479] mt-1.5">
                  Shown as a clickable link in your client calendar footer
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#8C8479] uppercase tracking-wider mb-3">
                  Footer Preview
                </label>
                <div className="bg-[#f7f3ed] rounded-lg p-4 border border-[#E8E3DC]">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 overflow-hidden"
                      style={{
                        backgroundColor: '#eeedfe',
                        color: '#3c3489',
                      }}
                    >
                      {(profile as any)?.avatar_url ? (
                        <img
                          src={(profile as any).avatar_url}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        getInitials(formData.full_name) || 'SR'
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#1A1612] truncate">
                        {formData.business_name || 'Your Business Name'}
                      </div>
                      <div className="flex items-center gap-2 text-xs mt-0.5">
                        {formData.contact_email && (
                          <>
                            <a
                              href={`mailto:${formData.contact_email}`}
                              className="text-[#c8a84b] hover:underline truncate"
                              onClick={(e) => e.preventDefault()}
                            >
                              {formData.contact_email}
                            </a>
                            {formData.website && <span className="text-[#8C8479]">•</span>}
                          </>
                        )}
                        {formData.website && (
                          <a
                            href={`https://${formData.website.replace(/^https?:\/\//, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#c8a84b] hover:underline truncate"
                            onClick={(e) => e.preventDefault()}
                          >
                            {formData.website.replace(/^https?:\/\//, '')}
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-[#1A1612] text-white rounded-lg hover:bg-[#2A2622] transition-colors disabled:opacity-50 font-medium"
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-5 h-5" />
              Account Information
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">{profile?.email}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Your login email address</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Created
                  </label>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">{formatDate(profile?.created_at)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Subscription Plan
                </label>
                <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 font-semibold capitalize">
                        {profile?.subscription_plan || 'Starter'}
                      </span>
                      {profile?.is_early_adopter && (
                        <span className="px-2.5 py-0.5 bg-[#F5EDD9] text-[#854F0B] text-xs font-medium rounded-full border border-[#C9A96E]">
                          ⭐ Early Adopter
                        </span>
                      )}
                    </div>
                    <span className="text-gray-600 text-sm">
                      (Monthly - ${profile?.subscription_price || 9}/month)
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    profile?.subscription_status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : profile?.subscription_status === 'canceled'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {profile?.subscription_status || 'active'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                {!showPasswordChange ? (
                  <button
                    onClick={() => setShowPasswordChange(true)}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    Change Password
                  </button>
                ) : (
                  <form onSubmit={handlePasswordChange} className="space-y-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Confirm new password"
                        required
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowPasswordChange(false);
                          setPasswordData({ newPassword: '', confirmPassword: '' });
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Billing Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Billing Email
                </label>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{formData.billing_email || profile?.email}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Update your billing email in the Profile section above
                </p>
              </div>

              {profile?.next_billing_date && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">
                      Next billing date: <span className="font-semibold text-gray-900">{formatDate(profile.next_billing_date)}</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <SubscriptionManagement
          currentPlan={profile?.subscription_plan || 'starter'}
          billingCycle={profile?.billing_cycle || 'monthly'}
          subscriptionStatus={profile?.subscription_status || 'active'}
          nextBillingDate={profile?.next_billing_date}
          onUpgrade={handleUpgrade}
          onCancel={handleCancelSubscription}
        />
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className={`rounded-lg shadow-lg p-4 flex items-center gap-3 ${
            toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            <Save className="w-5 h-5" />
            <p className="font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}