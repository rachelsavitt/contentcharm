import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { Menu, X, Check, Star, User, FileText, Share2, Paintbrush, CheckCircle, Download, Calendar, Link as LinkIcon, Smartphone } from 'lucide-react';

export function MarketingHomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [animationCycle, setAnimationCycle] = useState(0);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const testimonialRef = useRef<HTMLDivElement>(null);
  const [howItWorksVisible, setHowItWorksVisible] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const [testimonialVisible, setTestimonialVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation cycle for hero mockup
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationCycle((prev) => prev + 1);
    }, 7000); // Total cycle: 7 seconds
    return () => clearInterval(interval);
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === howItWorksRef.current && entry.isIntersecting) {
          setHowItWorksVisible(true);
        }
        if (entry.target === featuresRef.current && entry.isIntersecting) {
          setFeaturesVisible(true);
        }
        if (entry.target === testimonialRef.current && entry.isIntersecting) {
          setTestimonialVisible(true);
        }
      });
    }, observerOptions);

    if (howItWorksRef.current) observer.observe(howItWorksRef.current);
    if (featuresRef.current) observer.observe(featuresRef.current);
    if (testimonialRef.current) observer.observe(testimonialRef.current);

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F4]" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes drawLine {
          from {
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes iconBounce {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes ctaPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(201, 169, 110, 0.4);
          }
          50% {
            box-shadow: 0 0 0 15px rgba(201, 169, 110, 0);
          }
        }

        @keyframes approveAnimation {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes progressFill {
          from {
            width: 0%;
          }
          to {
            width: 33%;
          }
        }

        .fade-up-animate {
          animation: fadeUp 0.6s ease-out forwards;
        }

        .pulse-once {
          animation: pulse 0.6s ease-out;
        }

        .scroll-marquee {
          animation: scroll 40s linear infinite;
        }

        .scroll-marquee:hover {
          animation-play-state: paused;
        }

        .icon-hover:hover svg {
          animation: iconBounce 0.5s ease;
        }

        .cta-pulse {
          animation: ctaPulse 3s ease-in-out infinite;
        }

        .cta-pulse:hover {
          animation: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .fade-up-animate,
          .pulse-once,
          .scroll-marquee,
          .icon-hover:hover svg,
          .cta-pulse {
            animation: none;
          }
        }

        /* Hero mockup animations */
        .card-1-approve {
          animation: approveAnimation 0.5s ease-out 2s forwards;
        }

        .card-2-edit {
          animation: approveAnimation 0.5s ease-out 2.5s forwards;
        }

        .progress-bar {
          animation: progressFill 0.3s ease-out 3s forwards;
        }

        .connecting-line {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
        }

        .connecting-line.animate {
          animation: drawLine 1.5s ease-out forwards;
        }
      `}</style>

      <nav
        className={`fixed top-0 left-0 right-0 z-50 bg-white transition-shadow ${
          isScrolled ? 'shadow-sm' : ''
        }`}
        style={{ borderBottom: '1px solid #E8E3DC' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-[#C9A96E]" fill="#C9A96E" />
                <span style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic', fontWeight: 400, color: '#c8a84b', fontSize: '24px' }}>Content</span>
                <span style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'normal', fontWeight: 700, color: '#1a1a18', fontSize: '24px' }}>Charm</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('features')}
                className="text-[#1A1612] hover:text-[#C9A96E] transition"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-[#1A1612] hover:text-[#C9A96E] transition"
              >
                Pricing
              </button>
              <Link to="/help" className="text-[#1A1612] hover:text-[#C9A96E] transition">
                Help
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login" className="text-[#1A1612] hover:text-[#C9A96E] transition">
                Log In
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2 bg-[#1A1612] text-white rounded-[10px] hover:bg-[#2A2622] transition"
              >
                Start Free Trial
              </Link>
            </div>

            <button
              className="md:hidden text-[#1A1612]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#E8E3DC]">
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={() => scrollToSection('features')}
                className="block w-full text-left px-3 py-2 text-[#1A1612] hover:bg-[#FAF8F4] rounded"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="block w-full text-left px-3 py-2 text-[#1A1612] hover:bg-[#FAF8F4] rounded"
              >
                Pricing
              </button>
              <Link
                to="/help"
                className="block px-3 py-2 text-[#1A1612] hover:bg-[#FAF8F4] rounded"
              >
                Help
              </Link>
              <Link
                to="/login"
                className="block px-3 py-2 text-[#1A1612] hover:bg-[#FAF8F4] rounded"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="block text-center px-6 py-2 bg-[#1A1612] text-white rounded-[10px]"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        )}
      </nav>

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p
            className="text-[#7C9E8A] uppercase tracking-wider text-sm font-medium mb-6"
            style={{ letterSpacing: '0.1em' }}
          >
            Built for freelance social media managers
          </p>

          <h1
            className="text-4xl sm:text-5xl lg:text-[56px] leading-tight mb-6"
            style={{ fontFamily: 'DM Serif Display, serif', color: '#1A1612' }}
          >
            Your clients deserve better
            <br />
            <em>than a Google Doc.</em>
          </h1>

          <p className="text-lg text-[#8C8479] max-w-[560px] mx-auto mb-4 leading-relaxed">
            A branded approval page for every client. In their colors. With their logo. Tap to approve. No client logins required.
          </p>

          <p className="text-base text-[#8C8479] max-w-[540px] mx-auto mb-8 leading-relaxed">
            Content Charm replaces your Google Sheet, Notion template, and 47-message Slack thread with one branded link your client will actually want to use.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <Link
              to="/signup"
              className="px-8 py-3 bg-[#1A1612] text-white rounded-[10px] hover:bg-[#2A2622] transition font-medium"
            >
              Start Free Trial
            </Link>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="px-8 py-3 border-2 border-[#1A1612] text-[#1A1612] rounded-[10px] hover:bg-[#1A1612] hover:text-white transition font-medium"
            >
              See how it works ↓
            </button>
          </div>

          <div className="flex flex-col items-center gap-1 mb-2">
            <p className="text-sm text-[#8C8479]">14-day free trial. No credit card required.</p>

          </div>

          {/* Product Demo GIF */}
          <div className="mt-16 mx-auto" style={{ maxWidth: '900px' }}>
            <div style={{ background: '#1a1a18', borderRadius: '12px', padding: '10px 10px 6px', boxShadow: '0 8px 40px rgba(0,0,0,0.15)' }}>
              <div style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ff5f57' }}></div>
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#28c840' }}></div>
              </div>
              <img
                src="https://i.ibb.co/wZB3sMQR/content-charm-hero.png"
                alt="Content Charm calendar demo"
                style={{ width: '100%', borderRadius: '6px', display: 'block' }}
              />
            </div>
          </div>
        </div>
      </section>



      {/* Animated Marquee */}
      <section className="py-12 bg-[#F5F2ED] px-4 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center mb-6">
          <p className="text-[#8C8479] uppercase tracking-wider text-xs font-medium mb-2" style={{ letterSpacing: '0.1em' }}>Built for freelance SMMs who manage:</p>

        </div>
        <div className="relative">
          <div className="flex whitespace-nowrap">
            <div className="scroll-marquee flex gap-3 text-sm">
              {['Wellness Studios', 'Med Spas', 'Chiropractic', 'Physical Therapy', 'Marketing Agencies', 'Health Coaches', 'Yoga Studios', 'Beauty Brands', 'Dental Practices', 'Life Coaches'].map((item, i) => (
                <span key={i} className="px-4 py-2 bg-white rounded-full text-[#1A1612] border border-[#E8E3DC]">
                  {item}
                </span>
              ))}
              {['Wellness Studios', 'Med Spas', 'Chiropractic', 'Physical Therapy', 'Marketing Agencies', 'Health Coaches', 'Yoga Studios', 'Beauty Brands', 'Dental Practices', 'Life Coaches'].map((item, i) => (
                <span key={`dup-${i}`} className="px-4 py-2 bg-white rounded-full text-[#1A1612] border border-[#E8E3DC]">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 px-4" ref={howItWorksRef}>
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-4xl sm:text-5xl text-center mb-16"
            style={{ fontFamily: 'DM Serif Display, serif', color: '#1A1612' }}
          >
            Here's how it works.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Animated connecting line */}
            <svg className="hidden md:block absolute top-12 left-[16.666%] right-[16.666%] h-0.5" style={{ width: '66.666%' }}>
              <line
                x1="0"
                y1="1"
                x2="100%"
                y2="1"
                stroke="#E8E3DC"
                strokeWidth="2"
                strokeDasharray="10,5"
                className={`connecting-line ${howItWorksVisible ? 'animate' : ''}`}
              />
            </svg>

            {[
              {
                num: 1,
                icon: User,
                title: 'Set up your client in minutes',
                desc: 'Add their logo, brand colors, and platforms. Done once, looks professional forever.',
                delay: '0s'
              },
              {
                num: 2,
                icon: FileText,
                title: 'Build their content calendar',
                desc: 'Add captions, media, and scheduled dates. Everything in one place — no more spreadsheets.',
                delay: '0.2s'
              },
              {
                num: 3,
                icon: Share2,
                title: 'Send one link. They approve.',
                desc: 'Your client gets a branded page to review and approve every post. No login. No confusion. No chasing.',
                delay: '0.4s'
              }
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className={`bg-white rounded-[14px] p-8 text-center relative ${howItWorksVisible ? 'fade-up-animate' : 'opacity-0'}`}
                  style={{
                    border: '1px solid #E8E3DC',
                    animationDelay: step.delay
                  }}
                >
                  <div
                    className={`w-16 h-16 mx-auto mb-4 bg-[#C9A96E] rounded-full flex items-center justify-center text-2xl font-bold text-white ${howItWorksVisible ? 'pulse-once' : ''}`}
                    style={{
                      fontFamily: 'DM Serif Display, serif',
                      animationDelay: step.delay
                    }}
                  >
                    {step.num}
                  </div>
                  <Icon className="w-8 h-8 mx-auto mb-4 text-[#7C9E8A]" />
                  <h3
                    className="text-xl mb-3"
                    style={{ fontFamily: 'DM Serif Display, serif', color: '#1A1612' }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-[#8C8479] leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 bg-[#F5F2ED]" ref={featuresRef}>
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-4xl sm:text-5xl text-center mb-4"
            style={{ fontFamily: 'DM Serif Display, serif', color: '#1A1612' }}
          >
            Everything a freelancer needs.
            <br />
            <em>Nothing they don't.</em>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16">
            {[
              {
                title: 'White-label client pages',
                description:
                  "Your logo, your colors, your branding. The approval page looks like it was built just for your client.",
                icon: Paintbrush,
              },
              {
                title: 'Tap-to-approve',
                description:
                  'Clients approve or request edits in seconds — per post, from any device. No account needed, no confusion, no calls.',
                icon: CheckCircle,
              },
              {
                title: 'Export approved posts',
                description:
                  "Download everything that's been approved in one tap. Ready to schedule, ready to go.",
                icon: Download,
              },
              {
                title: 'Calendar + card view',
                description:
                  'Switch between a monthly calendar view and a card view — whatever works best for how you present content.',
                icon: Calendar,
              },
              {
                title: 'Shareable links',
                description:
                  'Generate a unique link for every client calendar. Share it anywhere — email, Slack, WhatsApp.',
                icon: LinkIcon,
              },
              {
                title: 'Works on any device',
                description:
                  'Your clients can review and approve on their phone, tablet, or desktop. Always looks great.',
                icon: Smartphone,
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className={`bg-white rounded-[14px] p-6 hover:transform hover:-translate-y-1 transition-all icon-hover ${featuresVisible ? 'fade-up-animate' : 'opacity-0'}`}
                  style={{
                    border: '1px solid #E8E3DC',
                    animationDelay: `${i * 0.1}s`
                  }}
                >
                  <Icon className="w-6 h-6 mb-4 text-[#7C9E8A]" />
                  <h3
                    className="text-xl mb-3"
                    style={{ fontFamily: 'DM Serif Display, serif', color: '#1A1612' }}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-[#8C8479] leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Section 1 - For Freelancers */}
      <div className="bg-white py-16 px-8 mb-16">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-40 items-center">
            <div style={{ width: '100%', maxWidth: '500px' }}>
              <div style={{ background: '#1a1a18', borderRadius: '12px', padding: '10px 10px 6px', boxShadow: '0 8px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ff5f57' }}></div>
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#28c840' }}></div>
                </div>
                <img
                  src="https://media.giphy.com/media/OtUylSSicYR5CdvBES/giphy.gif"
                  alt="Adding posts to calendar"
                  style={{ width: '100%', objectFit: 'cover', objectPosition: 'center', transform: 'scale(1.05)', borderRadius: '6px', display: 'block' }}
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
      <div className="bg-white py-16 px-8 mb-16">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-40 items-center">
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
            <div className="order-1 md:order-2" style={{ width: '100%', maxWidth: '500px' }}>
              <div style={{ background: '#1a1a18', borderRadius: '12px', padding: '10px 10px 6px', boxShadow: '0 8px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ff5f57' }}></div>
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ffbd2e' }}></div>
                  <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#28c840' }}></div>
                </div>
                <img
                  src="https://media.giphy.com/media/XqqAn6nrLET6Z41vUc/giphy.gif"
                  alt="Client approval modal"
                  style={{ width: '100%', objectFit: 'cover', objectPosition: 'center', transform: 'scale(1.05)', borderRadius: '6px', display: 'block' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Early Access Banner */}
      <section className="py-8 px-4" style={{ backgroundColor: '#C9A96E' }}>
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-white text-lg">⚡ Early access pricing — lock in your rate forever.</p>
            <p className="text-white opacity-80 text-sm">Price increases when we exit early access. Get in now.</p>
          </div>
          <a href="/signup" className="flex-shrink-0 px-6 py-3 bg-white text-[#1A1612] rounded-[10px] font-medium hover:bg-[#FAF8F4] transition">
            Start Free Trial →
          </a>
        </div>
      </section>



            <section id="pricing" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2
            className="text-4xl sm:text-5xl text-center mb-4"
            style={{ fontFamily: 'DM Serif Display, serif', color: '#1A1612' }}
          >
            Simple pricing. No surprises.
          </h2>
          <p className="text-center text-[#8C8479] mb-8">
            Simple pricing that grows with you. Lock in today's rate forever.
          </p>

          <div className="max-w-3xl mx-auto mb-12">
            <div className="bg-[#F5EDD9] border border-[#C9A96E] rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-[#1A1612] mb-2" style={{ fontFamily: 'DM Serif Display, serif' }}>
                🎉 Introductory Pricing
              </h3>
              <p className="text-sm text-[#8C8479]">
                We're new and our prices reflect that. Lock in today's rate forever — your price will never increase as long as you stay subscribed. Rates will rise as we grow.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className="bg-white rounded-[14px] p-8"
              style={{ border: '1px solid #E8E3DC' }}
            >
              <h3
                className="text-2xl mb-2"
                style={{ fontFamily: 'DM Serif Display, serif', color: '#1A1612' }}
              >
                Starter
              </h3>
              <div className="mb-2">
                <span className="text-4xl font-bold" style={{ color: '#1A1612' }}>
                  $9
                </span>
                <span className="text-[#8C8479]">/mo</span>
              </div>
              <p className="text-xs text-[#8C8479] mb-4">
                Regular price $29/mo — lock in today's rate forever
              </p>
              <p className="text-sm text-[#8C8479] mb-6">
                Perfect for freelancers just getting started
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Up to 3 clients',
                  'Shareable client approval links',
                  'Client reactions and feedback',
                  'Export approved posts',
                  'Email support',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#7C9E8A] shrink-0 mt-0.5" />
                    <span className="text-[#1A1612]">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className="block w-full text-center px-6 py-3 border-2 border-[#1A1612] text-[#1A1612] rounded-[10px] hover:bg-[#1A1612] hover:text-white transition font-medium"
              >
                Lock In This Price →
              </Link>
            </div>

            <div
              className="bg-white rounded-[14px] p-8 relative"
              style={{ border: '2px solid #1A1612', boxShadow: '0 6px 24px rgba(26,22,18,0.1)' }}
            >
              <div className="absolute top-0 right-8 transform -translate-y-1/2">
                <span className="bg-[#1A1612] text-white px-4 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
                  MOST POPULAR
                </span>
              </div>
              <h3
                className="text-2xl mb-2"
                style={{ fontFamily: 'DM Serif Display, serif', color: '#1A1612' }}
              >
                Pro
              </h3>
              <div className="mb-2">
                <span className="text-4xl font-bold" style={{ color: '#1A1612' }}>
                  $19
                </span>
                <span className="text-[#8C8479]">/mo</span>
              </div>
              <p className="text-xs text-[#8C8479] mb-4">
                Regular price $59/mo — lock in today's rate forever
              </p>
              <p className="text-sm text-[#8C8479] mb-6">
                For active freelancers managing multiple clients
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Up to 6 clients',
                  'Everything in Starter',
                  'Priority email support',
                  'Early adopter pricing locked forever',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#7C9E8A] shrink-0 mt-0.5" />
                    <span className="text-[#1A1612]">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className="block w-full text-center px-6 py-3 bg-[#1A1612] text-white rounded-[10px] hover:bg-[#2A2622] transition font-medium"
              >
                Lock In This Price →
              </Link>
            </div>

            <div
              className="bg-white rounded-[14px] p-8"
              style={{ border: '1px solid #E8E3DC' }}
            >
              <h3
                className="text-2xl mb-2"
                style={{ fontFamily: 'DM Serif Display, serif', color: '#1A1612' }}
              >
                Agency
              </h3>
              <div className="mb-2">
                <span className="text-4xl font-bold" style={{ color: '#1A1612' }}>
                  $39
                </span>
                <span className="text-[#8C8479]">/mo</span>
              </div>
              <p className="text-xs text-[#8C8479] mb-4">
                Regular price $99/mo — lock in today's rate forever
              </p>
              <p className="text-sm text-[#8C8479] mb-6">
                For growing agencies with large client rosters
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited clients',
                  'Everything in Pro',
                  '24hr priority support',
                  'Early adopter pricing locked forever',
                  'First access to new features',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-[#7C9E8A] shrink-0 mt-0.5" />
                    <span className="text-[#1A1612]">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/signup"
                className="block w-full text-center px-6 py-3 border-2 border-[#1A1612] text-[#1A1612] rounded-[10px] hover:bg-[#1A1612] hover:text-white transition font-medium"
              >
                Lock In This Price →
              </Link>
            </div>
          </div>

          <p className="text-center text-sm text-[#8C8479] mt-8">
            All plans include a 14-day free trial. Cancel anytime. No contracts.
          </p>
        </div>
      </section>

      <section className="py-20 px-4 bg-[#1A1612]">
        <div className="max-w-3xl mx-auto text-center">
          <h2
            className="text-4xl sm:text-5xl mb-4 text-white"
            style={{ fontFamily: 'DM Serif Display, serif' }}
          >
            Ready to impress your clients?
          </h2>
          <p className="text-white/70 mb-8">
            Lock in today's price forever. Rates will rise as we grow — yours never will.
          </p>
          <Link
            to="/signup"
            className="inline-block px-8 py-3 bg-[#C9A96E] text-[#1A1612] rounded-[10px] hover:bg-[#B89760] transition font-medium cta-pulse"
          >
            Start Free Trial
          </Link>
          <p className="text-white/50 text-sm mt-4">14-day free trial. No credit card required.</p>
        </div>
      </section>

      <footer className="bg-white py-12 px-4" style={{ borderTop: '1px solid #E8E3DC' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-[#C9A96E]" fill="#C9A96E" />
              <span style={{ fontFamily: "Playfair Display, serif", fontStyle: "italic", fontWeight: 400, color: "#c8a84b", fontSize: "24px" }}>Content</span>
              <span style={{ fontFamily: "Playfair Display, serif", fontStyle: "normal", fontWeight: 700, color: "#1a1a18", fontSize: "24px" }}>Charm</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <button
                onClick={() => scrollToSection('features')}
                className="text-[#8C8479] hover:text-[#1A1612] transition"
              >
                Features
              </button>
              <span className="text-[#E8E3DC]">·</span>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-[#8C8479] hover:text-[#1A1612] transition"
              >
                Pricing
              </button>
              <span className="text-[#E8E3DC]">·</span>
              <Link to="/help" className="text-[#8C8479] hover:text-[#1A1612] transition">
                Help
              </Link>
              <span className="text-[#E8E3DC]">·</span>
              <Link to="/privacy-policy" className="text-[#8C8479] hover:text-[#1A1612] transition">
                Privacy Policy
              </Link>
              <span className="text-[#E8E3DC]">·</span>
              <Link
                to="/terms-of-service"
                className="text-[#8C8479] hover:text-[#1A1612] transition"
              >
                Terms of Service
              </Link>
            </div>

            <div className="text-sm text-[#8C8479]">Made for freelancers ✦</div>
          </div>

          <div className="text-center text-sm text-[#8C8479]">
            © 2026 Content Charm. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
