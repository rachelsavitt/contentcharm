import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Sparkles, Users, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation Bar */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 700, color: '#c8a84b', fontSize: '24px' }}>
              Content
            </span>
            <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'normal', fontWeight: 700, fontSize: '24px', color: '#1a1a18' }}>
              Charm
            </span>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 text-slate-700 hover:text-slate-900 font-medium transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
            AI-Powered Social Media Calendar
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Create, manage, and optimize your social media content with intelligent automation
          </p>
          <div className="flex gap-4 justify-center mb-12">
            <button
              onClick={() => navigate('/signup')}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-white text-slate-900 rounded-lg font-semibold border-2 border-slate-200 hover:border-slate-300 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Hero GIF */}
        <div className="flex justify-center mb-16">
          <div style={{ maxWidth: '900px', width: '100%' }}>
            <div style={{ background: '#1a1a18', borderRadius: '12px', padding: '10px 10px 6px', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
              <div style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ff5f57' }}></div>
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#28c840' }}></div>
              </div>
              <img
                src="/assets/content-charm-hero.gif"
                alt="Content Charm calendar demo"
                style={{ width: '100%', borderRadius: '6px', display: 'block' }}
              />
            </div>
          </div>
        </div>

        {/* Stat Bar */}
        <div className="bg-white border-t border-b mb-16" style={{ borderColor: '#ece6dc' }}>
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center md:text-left">
              <div className="text-center">
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '34px', fontWeight: 700, color: '#c8a84b', marginBottom: '8px' }}>
                  500+
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Freelancers using Content Charm
                </div>
              </div>

              <div className="text-center border-l" style={{ borderColor: '#ece6dc' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '34px', fontWeight: 700, color: '#c8a84b', marginBottom: '8px' }}>
                  10,000+
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Posts approved
                </div>
              </div>

              <div className="text-center border-l" style={{ borderColor: '#ece6dc' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '34px', fontWeight: 700, color: '#c8a84b', marginBottom: '8px' }}>
                  4.9★
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Average rating
                </div>
              </div>

              <div className="text-center border-l" style={{ borderColor: '#ece6dc' }}>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '34px', fontWeight: 700, color: '#c8a84b', marginBottom: '8px' }}>
                  2 min
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Avg. client approval time
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Smart Scheduling</h3>
            <p className="text-slate-600">Plan your content calendar weeks in advance with intelligent date management</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">AI Assistant</h3>
            <p className="text-slate-600">Generate engaging captions and content ideas powered by advanced AI</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Client Management</h3>
            <p className="text-slate-600">Manage multiple clients and share calendars for approval and feedback</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Quick Export</h3>
            <p className="text-slate-600">Export your calendars in multiple formats for easy sharing and printing</p>
          </div>
        </div>

        {/* Feature Section 1 - For Freelancers */}
        <div className="bg-white py-16 px-8 rounded-2xl mb-16 shadow-sm">
          <div className="max-w-6xl mx-auto w-full">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div style={{ width: '100%' }}>
                <div style={{ background: '#1a1a18', borderRadius: '12px', padding: '10px 10px 6px', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
                  <div style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
                    <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ff5f57' }}></div>
                    <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                    <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#28c840' }}></div>
                  </div>
                  <img
                    src="/assets/content-charm-add-post.gif"
                    alt="Adding posts to calendar"
                    style={{ width: '100%', borderRadius: '6px', display: 'block' }}
                  />
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 600, color: '#c8a84b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                  For freelancers
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '42px', fontWeight: 700, color: '#1a1a18', marginBottom: '16px', lineHeight: '1.2' }}>
                  Build your content calendar in minutes
                </h2>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '18px', color: '#666', lineHeight: '1.7' }}>
                  Add post titles, captions, images, and platform tags. Everything organized in one beautiful calendar your clients will love.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Section 2 - For Clients */}
        <div className="bg-white py-16 px-8 rounded-2xl mb-16 shadow-sm">
          <div className="max-w-6xl mx-auto w-full">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', fontWeight: 600, color: '#c8a84b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                  For clients
                </div>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '42px', fontWeight: 700, color: '#1a1a18', marginBottom: '16px', lineHeight: '1.2' }}>
                  Clients approve in seconds. (Yes, there's confetti.)
                </h2>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '18px', color: '#666', lineHeight: '1.7' }}>
                  Share a branded link. Clients react, leave feedback, and approve — no login required, no confusion, no back-and-forth emails.
                </p>
              </div>
              <div className="order-1 md:order-2" style={{ width: '100%' }}>
                <div style={{ background: '#1a1a18', borderRadius: '12px', padding: '10px 10px 6px', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
                  <div style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
                    <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ff5f57' }}></div>
                    <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                    <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#28c840' }}></div>
                  </div>
                  <img
                    src="/assets/content-charm-modal.gif"
                    alt="Client approval modal"
                    style={{ width: '100%', borderRadius: '6px', display: 'block' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mb-16 w-full">
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '48px', fontWeight: 700, color: '#1a1a18', textAlign: 'center', marginBottom: '48px' }}>
            Freelancers love it
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div style={{ color: '#c8a84b', fontSize: '20px', marginBottom: '16px' }}>
                ★★★★★
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', fontStyle: 'italic', color: '#1a1a18', lineHeight: '1.6', marginBottom: '24px' }}>
                "I used to spend 20 minutes on the phone with every client explaining what to approve. Now I send one link and they do it themselves in 5 minutes."
              </p>
              <div className="flex items-center gap-3">
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#fbeaf0',
                  color: '#72243e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 600
                }}>
                  SM
                </div>
                <div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 600, color: '#1a1a18' }}>
                    Sarah M.
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#aaa' }}>
                    Freelance Social Media Manager
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div style={{ color: '#c8a84b', fontSize: '20px', marginBottom: '16px' }}>
                ★★★★★
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', fontStyle: 'italic', color: '#1a1a18', lineHeight: '1.6', marginBottom: '24px' }}>
                "My clients actually comment on how professional it looks. It's helped me charge more because the whole experience feels premium."
              </p>
              <div className="flex items-center gap-3">
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#eeedfe',
                  color: '#3c3489',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 600
                }}>
                  JL
                </div>
                <div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 600, color: '#1a1a18' }}>
                    Jess L.
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#aaa' }}>
                    Social Media Strategist
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <div style={{ color: '#c8a84b', fontSize: '20px', marginBottom: '16px' }}>
                ★★★★★
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '16px', fontStyle: 'italic', color: '#1a1a18', lineHeight: '1.6', marginBottom: '24px' }}>
                "Content approvals used to be my least favorite part of the job. Now it takes care of itself. Game changer for my workflow."
              </p>
              <div className="flex items-center gap-3">
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: '#e1f5ee',
                  color: '#0f6e56',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 600
                }}>
                  KR
                </div>
                <div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 600, color: '#1a1a18' }}>
                    Katie R.
                  </div>
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '12px', color: '#aaa' }}>
                    Content Creator & Strategist
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-center text-white mb-16">
          <h2 className="text-3xl font-bold mb-4">Ready to transform your social media strategy?</h2>
          <p className="text-lg mb-8 text-blue-100">Join thousands of content creators and marketers using our platform</p>
          <button
            onClick={() => navigate('/pricing')}
            className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            View Pricing
          </button>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200 pt-8 pb-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 700, color: '#c8a84b', fontSize: '20px' }}>
                  Content
                </span>
                <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'normal', fontWeight: 700, fontSize: '20px', color: '#1a1a18' }}>
                  Charm
                </span>
              </div>
              <p className="text-slate-600 text-sm">
                &copy; 2026 Content Charm. All rights reserved.
              </p>
            </div>
            <div className="flex gap-6">
              <a
                href="mailto:hello@rachelsavitt.com"
                className="text-slate-600 hover:text-slate-900 text-sm transition-colors"
              >
                Contact
              </a>
              <button
                onClick={() => navigate('/privacy-policy')}
                className="text-slate-600 hover:text-slate-900 text-sm transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => navigate('/terms-of-service')}
                className="text-slate-600 hover:text-slate-900 text-sm transition-colors"
              >
                Terms of Service
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}