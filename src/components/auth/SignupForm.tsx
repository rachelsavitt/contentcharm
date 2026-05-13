import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

interface SignupFormProps {
  onSuccess?: () => void;
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
        },
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        const dashboardUrl = `${window.location.origin}/dashboard`;
        const userName = email.split('@')[0];

        try {
          const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
          if (supabaseUrl) {
            await fetch(
              `${supabaseUrl}/functions/v1/send-welcome-email`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userEmail: email,
                  userName,
                  dashboardUrl,
                  userId: data.user.id,
                }),
              }
            );
          }
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
        }

        onSuccess?.();
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-[10px] text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-[11px] uppercase tracking-[0.8px] text-[#8C8479] font-semibold mb-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 border border-[#E8E3DC] rounded-[10px] text-[15px] text-[#1A1612] focus:outline-none focus:border-[#C9A96E] transition-colors"
          placeholder="Enter your email"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-[11px] uppercase tracking-[0.8px] text-[#8C8479] font-semibold mb-2">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 pr-12 border border-[#E8E3DC] rounded-[10px] text-[15px] text-[#1A1612] focus:outline-none focus:border-[#C9A96E] transition-colors"
            placeholder="Enter your password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-[#8C8479]" />
            ) : (
              <Eye className="h-4 w-4 text-[#8C8479]" />
            )}
          </button>
        </div>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-[11px] uppercase tracking-[0.8px] text-[#8C8479] font-semibold mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full px-4 py-3 pr-12 border border-[#E8E3DC] rounded-[10px] text-[15px] text-[#1A1612] focus:outline-none focus:border-[#C9A96E] transition-colors"
            placeholder="Confirm your password"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4 text-[#8C8479]" />
            ) : (
              <Eye className="h-4 w-4 text-[#8C8479]" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center px-4 py-3.5 bg-[#1A1612] text-white rounded-[10px] text-[15px] font-semibold hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <>
            <UserPlus className="h-4 w-4 mr-2" />
            Create Account
          </>
        )}
      </button>
    </form>
  );
}