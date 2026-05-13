import { useState } from 'react';
import { X, Mail, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SendToClientModalProps {
  calendarId: string;
  calendarTitle: string;
  clientName: string;
  month: string;
  shareToken: string;
  logoUrl?: string;
  hasBrandColors?: boolean;
  onClose: () => void;
}

export function SendToClientModal({
  calendarId,
  calendarTitle,
  clientName,
  month,
  shareToken,
  logoUrl,
  hasBrandColors,
  onClose,
}: SendToClientModalProps) {
  const [clientEmail, setClientEmail] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSend = async () => {
    if (!clientEmail.trim()) {
      setError('Please enter client email');
      return;
    }

    if (!clientEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setSending(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .maybeSingle();

      const freelancerName = profile?.full_name || user.email?.split('@')[0] || 'Your freelancer';
      const shareUrl = `${window.location.origin}/share/${shareToken}`;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Configuration error');
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/send-calendar-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({
            clientEmail: clientEmail.trim(),
            clientName,
            freelancerName,
            month,
            shareUrl,
            personalMessage: personalMessage.trim() || undefined,
            logoUrl,
            calendarId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Error sending email:', err);
      setError(err.message || 'Failed to send email. You can still copy the share link manually.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={sending}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#C9A96E]/10 rounded-full flex items-center justify-center">
            <Mail className="w-5 h-5 text-[#C9A96E]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Send to Client</h2>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Sent!</h3>
            <p className="text-gray-600">
              {clientName} will receive your calendar shortly.
            </p>
          </div>
        ) : (
          <>
            {/* Ready to send checklist */}
            <div className="mb-5 p-4 bg-[#FAF8F4] rounded-lg border border-[#E8E3DC]">
              <p className="text-xs uppercase tracking-wider text-[#8C8479] font-medium mb-3" style={{ letterSpacing: '0.08em' }}>Your client will see:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  {logoUrl ? (
                    <span className="text-green-600">✅</span>
                  ) : (
                    <span className="text-amber-500">⚠️</span>
                  )}
                  <span style={{ color: logoUrl ? '#1A1612' : '#8C8479' }}>
                    {logoUrl ? 'Client logo added' : 'No logo — add one in Client Settings for a branded welcome screen'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {hasBrandColors ? (
                    <span className="text-green-600">✅</span>
                  ) : (
                    <span className="text-amber-500">⚠️</span>
                  )}
                  <span style={{ color: hasBrandColors ? '#1A1612' : '#8C8479' }}>
                    {hasBrandColors ? 'Brand colors set' : 'No brand colors — add them in Client Settings for a fully custom page'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-600">✅</span>
                  <span style={{ color: '#1A1612' }}>Welcome screen ready — client will see a branded intro on first visit</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Email Address
                </label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A96E] focus:border-transparent"
                  disabled={sending}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Message (Optional)
                </label>
                <textarea
                  value={personalMessage}
                  onChange={(e) => setPersonalMessage(e.target.value)}
                  placeholder="Your April content is ready to review!"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A96E] focus:border-transparent resize-none"
                  disabled={sending}
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                disabled={sending}
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !clientEmail.trim()}
                className="flex-1 px-4 py-2 bg-[#C9A96E] text-white rounded-lg hover:bg-[#B08D5A] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Send Email
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
