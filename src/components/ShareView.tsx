import { useState, useEffect } from 'react';
import { Calendar, CalendarPost, supabase } from '../lib/supabase';
import { Calendar as CalendarIcon, Loader, ThumbsUp, MessageSquare, Check, X, Clock, ChevronLeft, ChevronRight, Sparkles, Instagram, Facebook, Linkedin, Twitter, Youtube, Share2, Sun, Moon } from 'lucide-react';
import { CelebrationAnimation } from './CelebrationAnimation';
import { ClientPostDetailModal } from './ClientPostDetailModal';
import confetti from 'canvas-confetti';

const googleFontsLink = document.createElement('link');
googleFontsLink.href = 'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap';
googleFontsLink.rel = 'stylesheet';
document.head.appendChild(googleFontsLink);

interface ShareViewProps {
  shareToken: string;
}

interface Client {
  id: string;
  name: string;
  brand_logo_url?: string;
  logo_url?: string;
  mockup_logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  brand_colors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  brand_fonts?: {
    heading: string;
    body: string;
  };
}

interface FreelancerProfile {
  user_id: string;
  full_name?: string;
  business_name?: string;
  contact_email?: string;
  website?: string;
  avatar_url?: string;
}

// Helper function to check if color needs dark text for contrast
function needsDarkText(hexColor: string): boolean {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return true if light color (needs dark text)
  return luminance > 0.6;
}

// Helper function to darken a color by a percentage
function darkenColor(hexColor: string, percent: number): string {
  const hex = hexColor.replace('#', '');
  const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - percent / 100));
  const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - percent / 100));
  const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - percent / 100));

  return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
}

// Helper function to add alpha to hex color
function hexToRgba(hexColor: string, alpha: number): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Helper function to get initials from name
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Helper function to get avatar colors by index
function getAvatarColors(index: number): { bg: string; text: string } {
  const colors = [
    { bg: '#fbeaf0', text: '#72243e' },
    { bg: '#eeedfe', text: '#3c3489' },
    { bg: '#e1f5ee', text: '#0f6e56' },
    { bg: '#faeeda', text: '#854f0b' },
  ];
  return colors[index % colors.length];
}

// Helper function to get platform colors
function getPlatformColors(platform: string): { bg: string; text: string } {
  const platformLower = platform.toLowerCase();
  const colors: Record<string, { bg: string; text: string }> = {
    'instagram': { bg: '#fbeaf0', text: '#72243e' },
    'tiktok': { bg: '#eeedfe', text: '#3c3489' },
    'youtube': { bg: '#fcebeb', text: '#791f1f' },
    'linkedin': { bg: '#e6f1fb', text: '#0c447c' },
    'facebook': { bg: '#eaf3de', text: '#27500a' },
    'pinterest': { bg: '#faece7', text: '#712b13' },
  };

  for (const [key, value] of Object.entries(colors)) {
    if (platformLower.includes(key)) {
      return value;
    }
  }

  return { bg: '#f5f5f5', text: '#666666' };
}

export function ShareView({ shareToken }: ShareViewProps) {
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [showEditsSent, setShowEditsSent] = useState(false);
  const [showAllApprovedModal, setShowAllApprovedModal] = useState(false);
  const [processingPost, setProcessingPost] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [freelancerProfile, setFreelancerProfile] = useState<FreelancerProfile | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  // Get brand colors with fallbacks
  const primaryColor = client?.primary_color || client?.brand_colors?.primary || '#7C9E8A';
  const secondaryColor = client?.secondary_color || client?.brand_colors?.secondary || '#C9A96E';
  const clientLogo = client?.logo_url || client?.brand_logo_url;
  const clientName = client?.name || calendar?.title || 'Content Calendar';

  useEffect(() => {
    if (calendar && posts.length > 0) {
      const key = 'welcome_seen_' + calendar.share_token;
      const seen = localStorage.getItem(key);
      if (!seen) {
        setShowWelcome(true);
      }
    }
  }, [calendar, posts]);

  const handleWelcomeDismiss = () => {
    if (calendar) {
      localStorage.setItem('welcome_seen_' + calendar.share_token, 'true');
    }
    setShowWelcome(false);
  };

  useEffect(() => {
    loadCalendarData();
    const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(darkModePreference);
  }, [shareToken]);

  const loadCalendarData = async () => {
    try {
      console.log('=== DEBUG: START LOADING CALENDAR ===');
      console.log('1. Share token from URL:', shareToken);

      const { data: calendarData, error: calendarError } = await supabase
        .from('calendars')
        .select('*')
        .eq('share_token', shareToken)
        .maybeSingle();

      console.log('2. Calendar found:', calendarData);
      console.log('2. Calendar error:', calendarError);

      if (calendarError) {
        console.error('Error loading calendar:', calendarError);
        throw calendarError;
      }

      if (!calendarData) {
        console.warn('No calendar found with share token:', shareToken);
        setLoading(false);
        return;
      }

      console.log('Calendar ID:', calendarData.id);
      setCalendar(calendarData);

      // Load freelancer profile
      if (calendarData.user_id) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, business_name, contact_email, website, avatar_url')
          .eq('id', calendarData.user_id)
          .maybeSingle();

        if (profileError) {
          console.error('Error loading freelancer profile:', profileError);
        } else if (profileData) {
          console.log('Freelancer profile loaded:', profileData);
          setFreelancerProfile({
            user_id: profileData.id,
            full_name: profileData.full_name,
            business_name: profileData.business_name,
            contact_email: profileData.contact_email,
            website: profileData.website,
            avatar_url: profileData.avatar_url,
          });
        }
      }

      if (calendarData.client_id) {
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', calendarData.client_id)
          .maybeSingle();

        if (clientError) {
          console.error('Error loading client:', clientError);
        }

        if (clientData) {
          console.log('Client loaded:', clientData);
          setClient(clientData);
        }
      }

      console.log('3. About to fetch posts for calendar_id:', calendarData.id);
      const { data: postsData, error: postsError } = await supabase
        .from('calendar_posts')
        .select('*')
        .eq('calendar_id', calendarData.id)
        .order('scheduled_date', { ascending: true, nullsFirst: false });

      console.log('3. Posts found:', postsData);
      console.log('3. Posts error:', postsError);
      console.log('3. Number of posts:', postsData?.length || 0);

      if (postsError) {
        console.error('Error loading posts:', postsError);
        throw postsError;
      }

      console.log('=== DEBUG: FINISHED LOADING - Setting', postsData?.length || 0, 'posts ===');
      setPosts(postsData || []);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAndSendFeedbackNotification = async () => {
    if (!calendar) return;

    const { data: allPosts } = await supabase
      .from('calendar_posts')
      .select('*')
      .eq('calendar_id', calendar.id);

    if (!allPosts || allPosts.length === 0) return;

    const allReviewed = allPosts.every(p =>
      p.approval_status === 'approved' ||
      p.approval_status === 'revision_requested' ||
      p.approval_status === 'declined'
    );

    if (allReviewed && client) {
      const approvedCount = allPosts.filter(p => p.approval_status === 'approved').length;
      const editsCount = allPosts.filter(p => p.approval_status === 'revision_requested').length;
      const declinedCount = allPosts.filter(p => p.approval_status === 'declined').length;

      const editsRequested = allPosts
        .filter(p => p.approval_status === 'revision_requested')
        .map(p => ({
          title: p.title,
          comment: p.client_feedback || 'No comment provided'
        }));

      const { data: calendarOwner } = await supabase
        .from('calendars')
        .select('user_id')
        .eq('id', calendar.id)
        .maybeSingle();

      if (calendarOwner) {
        const { data: { user } } = await supabase.auth.admin.getUserById(calendarOwner.user_id);

        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', user.id)
            .maybeSingle();

          const freelancerName = profile?.full_name || user.email?.split('@')[0] || 'Freelancer';
          const dashboardUrl = `${window.location.origin}/dashboard`;

          try {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            if (supabaseUrl) {
              await fetch(
                `${supabaseUrl}/functions/v1/send-feedback-notification`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    freelancerEmail: user.email,
                    freelancerName,
                    clientName: client.name,
                    month: calendar.title.split(' ')[0] || 'Content',
                    approvedCount,
                    editsCount,
                    declinedCount,
                    editsRequested,
                    dashboardUrl,
                    calendarId: calendar.id,
                  }),
                }
              );
            }
          } catch (error) {
            console.error('Failed to send feedback notification:', error);
          }
        }
      }
    }
  };

  const triggerFullScreenCelebration = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
          ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})`
          : 'rgb(124, 158, 138)';
      };

      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const secondaryColorHex = secondaryColor || '#C9A96E';
      const colors = [
        // 40% primary
        hexToRgb(primaryColor),
        hexToRgb(primaryColor),
        hexToRgb(primaryColor),
        hexToRgb(primaryColor),
        // 30% secondary
        hexToRgb(secondaryColorHex),
        hexToRgb(secondaryColorHex),
        hexToRgb(secondaryColorHex),
        // 20% gold
        '#C9A96E',
        '#C9A96E',
        // 10% white
        '#FFFFFF',
      ];

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval = window.setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        confetti({
          particleCount,
          startVelocity: 30,
          spread: 360,
          origin: {
            x: randomInRange(0.1, 0.3),
            y: Math.random() - 0.2,
          },
          colors,
        });
        confetti({
          particleCount,
          startVelocity: 30,
          spread: 360,
          origin: {
            x: randomInRange(0.7, 0.9),
            y: Math.random() - 0.2,
          },
          colors,
        });
      }, 250);
    }
  };

  const checkIfAllApproved = async () => {
    if (!calendar || !posts.length) return;

    const allApproved = posts.every(p => p.approval_status === 'approved');

    if (allApproved) {
      triggerFullScreenCelebration();
      setShowAllApprovedModal(true);
      setTimeout(() => setShowAllApprovedModal(false), 4000);
      await checkAndSendFeedbackNotification();
    }
  };

  const handleApprove = async (postId: string) => {
    setProcessingPost(postId);
    try {
      const { error } = await supabase
        .from('calendar_posts')
        .update({
          approval_status: 'approved',
          client_feedback: feedbackText || null,
        })
        .eq('id', postId);

      if (error) throw error;

      setShowCelebration(true);
      await loadCalendarData();

      // Check if all posts are now approved after reloading
      setTimeout(async () => {
        await checkIfAllApproved();
      }, 100);

      setSelectedPost(null);
      setFeedbackText('');
    } catch (error) {
      console.error('Error approving post:', error);
      alert('Failed to approve post');
    } finally {
      setProcessingPost(null);
    }
  };

  const handleRequestRevision = async (postId: string) => {
    if (!feedbackText.trim()) {
      alert('Please provide feedback for revision');
      return;
    }

    setProcessingPost(postId);
    try {
      const { error } = await supabase
        .from('calendar_posts')
        .update({
          approval_status: 'revision_requested',
          client_feedback: feedbackText,
        })
        .eq('id', postId);

      if (error) throw error;

      setShowEditsSent(true);
      await loadCalendarData();
      setSelectedPost(null);
      setFeedbackText('');

      setTimeout(() => setShowEditsSent(false), 3000);

      await checkAndSendFeedbackNotification();
    } catch (error) {
      console.error('Error requesting revision:', error);
      alert('Failed to request revision');
    } finally {
      setProcessingPost(null);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          label: 'Approved',
          icon: Check,
          bgColor: hexToRgba(primaryColor, 0.15),
          textColor: primaryColor,
          borderColor: hexToRgba(primaryColor, 0.3),
          glowColor: hexToRgba(primaryColor, 0.4),
        };
      case 'revision_requested':
        return {
          label: 'Edits Needed',
          icon: MessageSquare,
          bgColor: darkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.15)',
          textColor: darkMode ? '#FCD34D' : '#D97706',
          borderColor: darkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.3)',
          glowColor: 'rgba(245, 158, 11, 0.4)',
        };
      default:
        return {
          label: 'Pending',
          icon: Clock,
          bgColor: darkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)',
          textColor: darkMode ? '#93C5FD' : '#2563EB',
          borderColor: darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.3)',
          glowColor: 'rgba(59, 130, 246, 0.4)',
        };
    }
  };

  const getPlatformIcon = (platform: string) => {
    const platformLower = platform.toLowerCase();
    if (platformLower.includes('instagram')) return Instagram;
    if (platformLower.includes('facebook')) return Facebook;
    if (platformLower.includes('linkedin')) return Linkedin;
    if (platformLower.includes('twitter') || platformLower.includes('x')) return Twitter;
    if (platformLower.includes('youtube')) return Youtube;
    if (platformLower.includes('tiktok')) return Share2;
    return Share2;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();

    return { daysInMonth, startDayOfWeek, year, month };
  };

  const getPostsForDate = (date: Date) => {
    const dayOfMonth = date.getDate();

    return posts.filter(post => {
      // First try scheduled_date
      if (post.scheduled_date) {
        const postDate = new Date(post.scheduled_date + 'T12:00:00');
        return postDate.getDate() === dayOfMonth &&
               postDate.getMonth() === date.getMonth() &&
               postDate.getFullYear() === date.getFullYear();
      }
      // Fall back to day_number
      if ((post as any).day_number) {
        return (post as any).day_number === dayOfMonth;
      }
      return false;
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`}>
        <div className="backdrop-blur-xl bg-white/10 dark:bg-black/10 rounded-3xl p-12 shadow-2xl border border-white/20">
          <Loader className="w-12 h-12 animate-spin" style={{ color: primaryColor }} />
        </div>
      </div>
    );
  }

  if (!calendar) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100'}`}>
        <div className="backdrop-blur-xl bg-white/10 dark:bg-black/10 rounded-3xl shadow-2xl p-12 border border-white/20 text-center">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Calendar Not Found</h1>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>This link may be invalid or expired</p>
        </div>
      </div>
    );
  }

  const { daysInMonth, startDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const calendarDays = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  const pendingCount = posts.filter(p => p.approval_status === 'pending').length;
  const approvedCount = posts.filter(p => p.approval_status === 'approved').length;

  console.log('=== RENDER DEBUG ===');
  console.log('Posts array in render:', posts);
  console.log('Posts count:', posts.length);
  console.log('Current month:', currentMonth.toISOString());

  if (showWelcome && calendar && posts.length > 0) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-8"
        style={{ backgroundColor: hexToRgba(primaryColor, 0.06) }}
      >
        <div className="max-w-md w-full text-center">
          <div style={{ height: '4px', background: primaryColor, borderRadius: '2px', marginBottom: '48px' }} />
          {clientLogo ? (
            <img src={clientLogo} alt={clientName} style={{ width: '80px', height: '80px', objectFit: 'contain', margin: '0 auto 24px' }} />
          ) : (
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: primaryColor, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '28px', fontWeight: 700, color: 'white', fontFamily: 'DM Sans, sans-serif' }}>
              {clientName.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '32px', color: '#1A1612', marginBottom: '12px', lineHeight: 1.2 }}>
            Hi, {clientName}! 👋
          </h1>
          <p style={{ fontSize: '16px', color: '#8C8479', marginBottom: '8px', fontFamily: 'DM Sans, sans-serif' }}>
            {freelancerProfile?.business_name || 'Your social media manager'} has prepared your
          </p>
          <p style={{ fontSize: '20px', fontWeight: 600, color: '#1A1612', marginBottom: '8px', fontFamily: 'DM Sans, sans-serif' }}>
            {calendar.title}
          </p>
          <p style={{ fontSize: '16px', color: '#8C8479', marginBottom: '40px', fontFamily: 'DM Sans, sans-serif' }}>
            {posts.length} {posts.length === 1 ? 'post' : 'posts'} ready for your review
          </p>
          <button
            onClick={handleWelcomeDismiss}
            style={{ backgroundColor: primaryColor, color: 'white', border: 'none', borderRadius: '12px', padding: '16px 40px', fontSize: '16px', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', width: '100%', maxWidth: '320px' }}
          >
            Review my content →
          </button>
          <p style={{ fontSize: '13px', color: '#C9A96E', marginTop: '32px', fontFamily: 'DM Sans, sans-serif' }}>
            ✦ Prepared by {freelancerProfile?.business_name || 'your social media manager'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen transition-colors duration-500"
      style={{
        backgroundColor: darkMode ? '#1A1612' : hexToRgba(primaryColor, 0.06),
      }}
    >
      {/* Brand color top bar */}
      <div style={{ height: '4px', background: primaryColor }} />

      {showCelebration && (
        <CelebrationAnimation onComplete={() => setShowCelebration(false)} />
      )}

      {showEditsSent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md mx-4 transform animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-xl" style={{ backgroundColor: primaryColor }}>
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 mb-3" style={{ fontFamily: 'DM Serif Display, serif' }}>
                Your Edits Have Been Sent!
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                The content creator will review your feedback and make the requested changes.
              </p>
            </div>
          </div>
        </div>
      )}

      {showAllApprovedModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-lg mx-4 transform animate-in zoom-in-95 duration-500">
            <div className="flex flex-col items-center text-center">
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-xl"
                style={{ backgroundColor: primaryColor }}
              >
                <span className="text-5xl">🎉</span>
              </div>
              <h3 className="text-4xl font-black text-gray-900 mb-4" style={{ fontFamily: 'DM Serif Display, serif' }}>
                All Posts Approved!
              </h3>
              <p className="text-xl text-gray-700 leading-relaxed mb-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                <strong>{clientName}</strong> has approved all <strong>{posts.length}</strong> posts for <strong>{calendar?.title}</strong>
              </p>
              <p className="text-lg text-gray-600" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                Your freelancer will be notified.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="sticky top-0 z-40 border-b transition-all duration-300"
        style={{
          backgroundColor: darkMode ? '#1A1612' : '#ffffff',
          borderColor: primaryColor,
          borderBottomWidth: '2px',
        }}
      >
        <div className="w-full px-6 md:px-10 py-6 md:py-8">
          {/* Mobile Layout (< 768px) */}
          <div className="md:hidden flex flex-col gap-4">
            {/* Line 1: Avatar + Name */}
            <div className="flex items-center gap-3">
              {clientLogo ? (
                <div className="transition-all duration-300">
                  <img
                    src={clientLogo}
                    alt={`${clientName} Logo`}
                    className="w-auto object-contain"
                    style={{ width: '48px', height: '48px' }}
                    onError={(e) => {
                      console.error('Logo failed to load:', clientLogo);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                (() => {
                  const initials = getInitials(clientName);
                  return (
                    <div
                      className="flex items-center justify-center font-bold"
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '8px',
                        backgroundColor: '#fbeaf0',
                        color: '#72243e',
                        fontSize: '16px',
                      }}
                    >
                      {initials}
                    </div>
                  );
                })()
              )}

              <div className="flex-1">
                <h1
                  style={{
                    fontFamily: "'Inter', -apple-system, sans-serif",
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#1a1a18',
                    letterSpacing: '-0.3px',
                    marginBottom: '2px'
                  }}
                >
                  {clientName}
                </h1>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '12px',
                    color: '#aaa',
                    fontWeight: 400
                  }}
                >
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Content Calendar
                </p>
              </div>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="border p-2.5 transition-all duration-300 hover:scale-105"
                style={{
                  borderColor: darkMode ? '#3A3530' : '#E8E3DC',
                  borderRadius: '8px',
                  backgroundColor: darkMode ? '#1A1612' : 'transparent',
                }}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-4 h-4" style={{ color: secondaryColor }} /> : <Moon className="w-4 h-4" style={{ color: '#8C8479' }} />}
              </button>
            </div>

            {/* Line 2: Status Pills */}
            <div className="flex items-center gap-2">
              {approvedCount > 0 && (
                <div
                  style={{
                    backgroundColor: '#eaf3de',
                    color: '#3b6d11',
                    borderRadius: '999px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  {approvedCount} Approved
                </div>
              )}

              {pendingCount > 0 && (
                <div
                  style={{
                    backgroundColor: '#faeeda',
                    color: '#854f0b',
                    borderRadius: '999px',
                    padding: '6px 14px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  {pendingCount} Pending
                </div>
              )}
            </div>
          </div>

          {/* Desktop Layout (>= 768px) */}
          <div className="hidden md:flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-center gap-6 text-center md:text-left">
              {clientLogo ? (
                <div className="transition-all duration-300">
                  <img
                    src={clientLogo}
                    alt={`${clientName} Logo`}
                    className="w-auto object-contain mx-auto md:mx-0"
                    style={{ width: '64px', height: '64px' }}
                    onError={(e) => {
                      console.error('Logo failed to load:', clientLogo);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ) : (
                (() => {
                  const initials = getInitials(clientName);
                  return (
                    <div
                      className="flex items-center justify-center font-bold"
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '8px',
                        backgroundColor: '#fbeaf0',
                        color: '#72243e',
                        fontSize: '20px',
                      }}
                    >
                      {initials}
                    </div>
                  );
                })()
              )}

              <div>
                <h1
                  style={{
                    fontFamily: "'Inter', -apple-system, sans-serif",
                    fontSize: '22px',
                    fontWeight: 700,
                    color: '#1a1a18',
                    letterSpacing: '-0.3px',
                    marginBottom: '4px'
                  }}
                >
                  {clientName}
                </h1>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '13px',
                    color: '#aaa',
                    fontWeight: 400
                  }}
                >
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Content Calendar
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {approvedCount > 0 && (
                  <div
                    style={{
                      backgroundColor: '#eaf3de',
                      color: '#3b6d11',
                      borderRadius: '999px',
                      padding: '7px 16px',
                      fontSize: '13px',
                      fontWeight: 600
                    }}
                  >
                    {approvedCount} Approved
                  </div>
                )}

                {pendingCount > 0 && (
                  <div
                    style={{
                      backgroundColor: '#faeeda',
                      color: '#854f0b',
                      borderRadius: '999px',
                      padding: '7px 16px',
                      fontSize: '13px',
                      fontWeight: 600
                    }}
                  >
                    {pendingCount} Pending
                  </div>
                )}
              </div>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="border p-3 transition-all duration-300 hover:scale-105"
                style={{
                  borderColor: darkMode ? '#3A3530' : '#E8E3DC',
                  borderRadius: '8px',
                  backgroundColor: darkMode ? '#1A1612' : 'transparent',
                }}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-5 h-5" style={{ color: secondaryColor }} /> : <Moon className="w-5 h-5" style={{ color: '#8C8479' }} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {calendar?.approval_deadline && (
        (() => {
          const deadline = new Date(calendar.approval_deadline);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          deadline.setHours(0, 0, 0, 0);
          const daysRemaining = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const isPast = daysRemaining < 0;
          const isUrgent = daysRemaining <= 3 && daysRemaining >= 0;
          const isDueToday = daysRemaining === 0;
          const formattedDate = new Date(calendar.approval_deadline).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          });

          return (
            <div
              className="border-b-2 py-3 px-8 flex items-center justify-center gap-2"
              style={{
                backgroundColor: isPast ? '#FDF0ED' : isUrgent ? '#FBF2E0' : '#FBF5EF',
                borderBottomColor: isPast ? '#D4614A' : '#C9A96E',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '13px',
                color: isPast ? '#D4614A' : isUrgent ? '#C9973A' : '#8C8479',
                fontWeight: isUrgent || isPast ? 600 : 400,
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: isPast ? '#D4614A' : '#C9A96E', flexShrink: 0 }}
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {isPast ? (
                <span>This content was due for review on {formattedDate}</span>
              ) : isDueToday ? (
                <span>Review requested for today</span>
              ) : isUrgent ? (
                <span>Please review by {formattedDate} — {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining</span>
              ) : (
                <span>Content review requested by {formattedDate}</span>
              )}
            </div>
          );
        })()
      )}

      <main className="w-full px-4 sm:px-6 py-8">
        <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={previousMonth}
              className="transition-all duration-300"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                border: '1px solid #ece6dc',
                background: '#fff',
                color: '#888',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ‹
            </button>
            <h2 style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: '20px',
              fontWeight: 700,
              color: '#1a1a18'
            }}>
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={nextMonth}
              className="transition-all duration-300"
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '7px',
                border: '1px solid #ece6dc',
                background: '#fff',
                color: '#888',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ›
            </button>
          </div>

          {/* Mobile hint text */}
          <p className="md:hidden text-xs italic" style={{ color: darkMode ? '#C4BDB2' : '#8C8479' }}>
            Tap any post to review and approve
          </p>

          {/* Desktop hint text */}
          <p className="hidden md:block text-xs italic" style={{ color: darkMode ? '#C4BDB2' : '#8C8479' }}>
            Click any post to review and approve
          </p>
        </div>

        <div className="overflow-hidden"
          style={{
            backgroundColor: darkMode ? '#1A1612' : 'transparent',
            padding: '28px 32px',
          }}
        >
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-[6px] md:gap-4 mb-3 md:mb-4">
            {dayNames.map(day => (
              <div key={day} className="text-center font-semibold"
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: darkMode ? '#C4BDB2' : '#8C8479'
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid - Full 7 columns on all screens */}
          <div className="grid grid-cols-7 gap-[4px] md:gap-6">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dayPosts = getPostsForDate(date);
              if (dayPosts.length > 0) {
                console.log(`Posts for ${date.toISOString().split('T')[0]}:`, dayPosts);
              }
              const today = isToday(date);
              const past = isPast(date);
              const isOtherMonth = date.getMonth() !== currentMonth.getMonth();

              return (
                <div
                  key={date.toISOString()}
                  className="border transition-all duration-300"
                  style={{
                    aspectRatio: '1',
                    backgroundColor: darkMode ? '#2A2622' : '#FFFFFF',
                    borderWidth: today ? '2px' : '1px',
                    borderColor: today ? primaryColor : '#E8E3DC',
                    borderRadius: '8px',
                    opacity: past && !today ? 0.6 : 1,
                  }}
                >
                  <div className="h-full flex flex-col gap-1 md:gap-1.5 p-1.5 md:p-2.5">
                    <div className="font-semibold md:text-[15px]"
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: today ? primaryColor : isOtherMonth ? '#E8E3DC' : '#1a1a18'
                      }}
                    >
                      {date.getDate()}
                    </div>

                    <div className="flex-1 space-y-1 md:space-y-1.5">
                      {/* Mobile: Show only colored dots */}
                      <div className="md:hidden flex flex-wrap gap-1">
                        {dayPosts.slice(0, 3).map(post => {
                          const status = post.approval_status || 'pending';
                          let statusColor = '#ef9f27';
                          if (status === 'approved') statusColor = '#639922';
                          if (status === 'revision_requested') statusColor = '#ef4444';

                          return (
                            <button
                              key={post.id}
                              onClick={() => {
                                setSelectedPost(post);
                                setFeedbackText(post.client_feedback || '');
                              }}
                              className="cursor-pointer"
                              style={{
                                width: '14px',
                                height: '14px',
                                borderRadius: '50%',
                                backgroundColor: statusColor,
                                border: 'none',
                                padding: 0,
                                minWidth: '14px',
                              }}
                              aria-label={`View post: ${post.title}`}
                            />
                          );
                        })}
                      </div>

                      {/* Desktop: Show post pills with text */}
                      <div className="hidden md:block space-y-1.5">
                        {dayPosts.slice(0, 2).map(post => {
                          const status = post.approval_status || 'pending';
                          let statusColor = '#ef9f27';
                          if (status === 'approved') statusColor = '#639922';
                          if (status === 'revision_requested') statusColor = '#ef4444';

                          const platform = ((post as any).platforms && (post as any).platforms[0]) || post.platform;

                          // Use card_color if available, otherwise fall back to platform colors
                          const cardColor = (post as any).card_color;
                          const bgColor = cardColor || getPlatformColors(platform).bg;
                          const textColor = cardColor ? (needsDarkText(cardColor) ? '#1a1a18' : '#FFFFFF') : getPlatformColors(platform).text;

                          return (
                            <button
                              key={post.id}
                              onClick={() => {
                                setSelectedPost(post);
                                setFeedbackText(post.client_feedback || '');
                              }}
                              className="w-full rounded overflow-hidden hover:shadow-lg transition-all cursor-pointer text-left flex items-center gap-2"
                              style={{
                                backgroundColor: bgColor,
                                border: 'none',
                                borderRadius: '6px',
                                padding: '4px 8px',
                              }}
                            >
                              <div
                                style={{
                                  width: '6px',
                                  height: '6px',
                                  borderRadius: '50%',
                                  backgroundColor: statusColor,
                                  flexShrink: 0,
                                }}
                              />
                              <p
                                className="flex-1"
                                style={{
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  color: textColor,
                                  fontFamily: 'DM Sans, sans-serif',
                                  overflow: 'hidden',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  lineHeight: '1.3',
                                }}
                              >
                                {platform ? `${platform} · ${post.title}` : post.title}
                              </p>
                            </button>
                          );
                        })}
                        {dayPosts.length > 2 && (
                          <div
                            className="text-center"
                            style={{
                              fontSize: '9px',
                              color: '#8C8479',
                              paddingTop: '2px'
                            }}
                          >
                            +{dayPosts.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t"
            style={{
              borderColor: '#ece6dc',
              backgroundColor: '#fff',
              borderTop: '1px solid #ece6dc',
              marginLeft: '-32px',
              marginRight: '-32px',
              padding: '20px 40px',
            }}
          >
            {/* Mobile Footer (< 768px) - Stacked */}
            <div className="md:hidden flex flex-col gap-4">
              {/* Legend on top */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#639922'
                  }} />
                  <span style={{
                    fontSize: '12px',
                    color: '#8C8479'
                  }}>
                    Approved
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#ef9f27'
                  }} />
                  <span style={{
                    fontSize: '12px',
                    color: '#8C8479'
                  }}>
                    Pending
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444'
                  }} />
                  <span style={{
                    fontSize: '12px',
                    color: '#8C8479'
                  }}>
                    Edits needed
                  </span>
                </div>
              </div>

              {/* Freelancer info below */}
              {freelancerProfile && (freelancerProfile.business_name || freelancerProfile.contact_email || freelancerProfile.website) && (
                <div className="flex flex-wrap items-center gap-2 pt-3 border-t" style={{ borderColor: '#ece6dc' }}>
                  <Sparkles style={{ width: '20px', height: '20px', color: '#c8a84b', flexShrink: 0 }} />
                  {freelancerProfile.business_name && (
                    <>
                      <span style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#1a1a18',
                        fontFamily: 'DM Sans, sans-serif'
                      }}>
                        {freelancerProfile.business_name}
                      </span>
                      {(freelancerProfile.contact_email || freelancerProfile.website) && (
                        <span style={{ color: '#8C8479', fontSize: '13px' }}>•</span>
                      )}
                    </>
                  )}
                  {freelancerProfile.contact_email && (
                    <>
                      <a
                        href={`mailto:${freelancerProfile.contact_email}`}
                        style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#c8a84b',
                          textDecoration: 'none',
                          fontFamily: 'DM Sans, sans-serif'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                      >
                        {freelancerProfile.contact_email}
                      </a>
                      {freelancerProfile.website && (
                        <span style={{ color: '#8C8479', fontSize: '13px' }}>•</span>
                      )}
                    </>
                  )}
                  {freelancerProfile.website && (
                    <a
                      href={freelancerProfile.website.startsWith('http') ? freelancerProfile.website : `https://${freelancerProfile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#c8a84b',
                        textDecoration: 'none',
                        fontFamily: 'DM Sans, sans-serif'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      {freelancerProfile.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Footer (>= 768px) - Side by side */}
            <div className="hidden md:flex items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#639922'
                  }} />
                  <span style={{
                    fontSize: '12px',
                    color: '#8C8479'
                  }}>
                    Approved
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#ef9f27'
                  }} />
                  <span style={{
                    fontSize: '12px',
                    color: '#8C8479'
                  }}>
                    Pending review
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: '#ef4444'
                  }} />
                  <span style={{
                    fontSize: '12px',
                    color: '#8C8479'
                  }}>
                    Edits needed
                  </span>
                </div>
              </div>

              {freelancerProfile && (freelancerProfile.business_name || freelancerProfile.contact_email || freelancerProfile.website) && (
                <div className="flex items-center gap-2">
                  <Sparkles style={{ width: '20px', height: '20px', color: '#c8a84b' }} />
                  {freelancerProfile.business_name && (
                    <>
                      <span style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: '#1a1a18',
                        fontFamily: 'DM Sans, sans-serif'
                      }}>
                        {freelancerProfile.business_name}
                      </span>
                      {(freelancerProfile.contact_email || freelancerProfile.website) && (
                        <span style={{ color: '#8C8479', fontSize: '13px' }}>•</span>
                      )}
                    </>
                  )}
                  {freelancerProfile.contact_email && (
                    <>
                      <a
                        href={`mailto:${freelancerProfile.contact_email}`}
                        style={{
                          fontSize: '13px',
                          fontWeight: 500,
                          color: '#c8a84b',
                          textDecoration: 'none',
                          fontFamily: 'DM Sans, sans-serif'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                      >
                        {freelancerProfile.contact_email}
                      </a>
                      {freelancerProfile.website && (
                        <span style={{ color: '#8C8479', fontSize: '13px' }}>•</span>
                      )}
                    </>
                  )}
                  {freelancerProfile.website && (
                    <a
                      href={freelancerProfile.website.startsWith('http') ? freelancerProfile.website : `https://${freelancerProfile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#c8a84b',
                        textDecoration: 'none',
                        fontFamily: 'DM Sans, sans-serif'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                    >
                      {freelancerProfile.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {!loading && posts.length === 0 && (
          <div className="text-center py-16 px-4">
            <CalendarIcon className="w-16 h-16 mx-auto mb-4" style={{ color: '#8C8479' }} />
            <p style={{
              fontSize: '16px',
              color: '#8C8479',
              fontFamily: 'DM Sans, system-ui, sans-serif'
            }}>
              No posts have been added to this calendar yet. Check back soon!
            </p>
          </div>
        )}
      </main>

      {selectedPost && (
        <ClientPostDetailModal
          post={selectedPost}
          onClose={() => {
            setSelectedPost(null);
            setFeedbackText('');
          }}
          onUpdate={loadCalendarData}
          brandName={clientName}
          brandLogoUrl={clientLogo}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
      )}
    </div>
  );
}
