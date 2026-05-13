import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles } from 'lucide-react';

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = isLogin
      ? await signIn(email, password)
      : await signUp(email, password);

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4] flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#C9A96E] rounded-2xl mb-4" style={{ boxShadow: '0 6px 24px rgba(26, 22, 18, 0.12)' }}>
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl text-[#1A1612] mb-2" style={{ fontFamily: 'DM Serif Display, serif' }}>
            <span className="text-[#C9A96E] italic">Content</span> Charm
          </h1>
          <p className="text-[#8C8479]">
            AI-powered content calendars for brands that shine
          </p>
        </div>

        <div className="card p-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-[10px] font-medium transition-colors ${
                isLogin
                  ? 'bg-[#1A1612] text-white'
                  : 'bg-[#FAF8F4] text-[#8C8479] hover:bg-[#E8E3DC]'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-[10px] font-medium transition-colors ${
                !isLogin
                  ? 'bg-[#1A1612] text-white'
                  : 'bg-[#FAF8F4] text-[#8C8479] hover:bg-[#E8E3DC]'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-uppercase block mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-[#E8E3DC] rounded-[10px] focus:ring-2 focus:ring-[#C9A96E] focus:border-transparent text-[#1A1612]"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="label-uppercase block mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#E8E3DC] rounded-[10px] focus:ring-2 focus:ring-[#C9A96E] focus:border-transparent text-[#1A1612]"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-[#D4614A]/10 border border-[#D4614A]/30 text-[#D4614A] px-4 py-2 rounded-[10px] text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {!isLogin && (
            <div className="mt-6 pt-6 border-t border-[#E8E3DC]">
              <div className="text-sm text-[#8C8479] space-y-2">
                <p className="font-semibold text-[#1A1612]">Free tier includes:</p>
                <ul className="space-y-1 ml-4">
                  <li>• 1 calendar per month</li>
                  <li>• All core features</li>
                  <li>• PDF export</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        <p className="text-center mt-6 text-sm text-[#8C8479]">
          {isLogin ? "New to Content Charm? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#C9A96E] hover:text-[#1A1612] font-medium"
          >
            {isLogin ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}