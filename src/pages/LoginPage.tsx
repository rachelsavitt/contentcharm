import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth';
import { Sparkles } from 'lucide-react';

export function LoginPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF8F4]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A96E]"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF8F4] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-3">
            <Sparkles className="h-8 w-8 text-[#C9A96E]" fill="#C9A96E" />
          </div>
          <h1 className="text-3xl mb-2">
            <span className="italic" style={{ fontFamily: 'Playfair Display, serif', color: '#C9A96E' }}>Content</span>
            <span style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'normal', fontWeight: 700, color: '#1A1612' }}>Charm</span>
          </h1>
          <p className="text-sm text-[#8C8479]">Beautiful content approvals for freelancers</p>
        </div>
        <div className="bg-white border border-[#E8E3DC] rounded-2xl shadow-[0_4px_24px_rgba(26,22,18,0.07)] p-9">
          <LoginForm />
        </div>
        <p className="text-center text-[13px] text-[#8C8479]">
          New to Content Charm?{' '}
          <Link
            to="/signup"
            className="text-[#C9A96E] hover:underline font-medium"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}