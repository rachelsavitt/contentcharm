import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Eye, EyeOff, LogIn } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
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

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center px-4 py-3.5 bg-[#1A1612] text-white rounded-[10px] text-[15px] font-semibold hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
        ) : (
          <>
            <LogIn className="h-4 w-4 mr-2" />
            Sign In
          </>
        )}
      </button>
    </form>
  );
}