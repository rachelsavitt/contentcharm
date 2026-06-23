import { useState, useEffect } from 'react';
import { Calendar, CalendarPost, supabase } from '../lib/supabase';
import { Share2, ArrowLeft, Plus, Copy, Check, Video, Mail, Eye, ChevronLeft, ChevronRight, X, Bell, Loader2, Sparkles } from 'lucide-react';
import { PostDetailModal } from './PostDetailModal';
import { PostCreator } from './PostCreator';
import { ExportCalendar } from './ExportCalendar';
import { SendToClientModal } from './SendToClientModal';
import { MediaPreview } from './MediaPreview';
import { MediaUpload } from './MediaUpload';
import { MediaLinkInput } from './MediaLinkInput';
import { SocialMediaMockup } from './SocialMediaMockup';
import { AIContentStudio } from './AIContentStudio';

interface CalendarViewProps {
  calendar: Calendar;
  onBack?: () => void;
  onUpdate?: () => void;
}

interface Client {
  id: string;
  name: string;
  brand_logo_url?: string;
  mockup_logo_url?: string;
  brand_colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

const ALL_PLATFORMS = [
  'Instagram',
  'TikTok',
  'YouTube',
  'LinkedIn',
  'X (Twitter)',
  'Facebook',
  'Pinterest',
  'Snapchat',
];

export function CalendarView({ calendar: initialCalendar, autoOpenStudio, onBack, onUpdate }: CalendarViewProps) {
  const [calendar, setCalendar] = useState(initialCalendar);
  const [client, setClient] = useState<Client | null>(null);
  const [posts, setPosts] = useState<CalendarPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null);
  const [showPostCreator, setShowPostCreator] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showCopyChecklist, setShowCopyChecklist] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);
  const [reminderFrequency, setReminderFrequency] = useState('off');
  const [showReminderDropdown, setShowReminderDropdown] = useState(false);
  const [showGenerateCaptions, setShowGenerateCaptions] = useState(false);
  useEffect(() => {
    if (autoOpenStudio) {
      setShowGenerateCaptions(true);
    }
  }, [autoOpenStudio]);

  const handleSendReminder = async () => {
    const pendingPosts = posts.filter(p => p.approval_status === 'pending' || p.approval_status === 'revision_requested');
    if (pendingPosts.length === 0) {
      alert('All posts are already approved!');
      return;
    }

    const clientEmail = prompt('Enter client email address to send reminder:');
    if (!clientEmail || !clientEmail.includes('@')) return;

    setSendingReminder(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase.from('profiles').select('business_name, full_name').eq('id', user?.id).single();
      const freelancerName = profile?.business_name || profile?.full_name || 'Your social media manager';
      const shareUrl = `${window.location.origin}/share/${calendar.share_token}`;
      const primaryColor = client?.brand_colors?.primary || client?.primary_color || '#C9A96E';

      const { data, error } = await supabase.functions.invoke('send-reminder-email', {
        body: {
          clientEmail,
          clientName: client?.name || calendar.title,
          freelancerName,
          calendarTitle: calendar.title,
          shareUrl,
          pendingPosts: pendingPosts.map(p => ({ title: p.title, scheduled_date: p.scheduled_date, platform: p.platform })),
          primaryColor,
          logoUrl: client?.brand_logo_url,
          calendarId: calendar.id,
        },
      });

      if (error) throw error;
      setReminderSent(true);
      setTimeout(() => setReminderSent(false), 3000);
    } catch (err) {
      console.error('Error sending reminder:', err);
      alert('Failed to send reminder. Please try again.');
    } finally {
      setSendingReminder(false);
    }
  };
  const [showSendModal, setShowSendModal] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(calendar.title);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editingPost, setEditingPost] = useState<CalendarPost | null>(null);
  const [formData, setFormData] = useState({
    platform: calendar.platforms?.[0] || 'Instagram',
    platforms: [calendar.platforms?.[0] || 'Instagram'],
    title: '',
    caption: '',
    image_url: '',
    video_url: '',
    thumbnail_url: '',
    media_type: '' as 'image' | 'video' | '',
    scheduled_date: '',
    card_color: '' as string,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [calendar.id]);

  const loadData = async () => {
    try {
      if (calendar.client_id) {
        const { data: clientData } = await supabase
          .from('clients')
          .select('*')
          .eq('id', calendar.client_id)
          .maybeSingle();

        if (clientData) {
          setClient(clientData);
        }
      }

      const { data: postsData, error } = await supabase
        .from('calendar_posts')
        .select('*')
        .eq('calendar_id', calendar.id)
        .order('scheduled_date', { ascending: true, nullsFirst: false });

      if (error) throw error;
      setPosts(postsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/share/${calendar.share_token}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setShowCopyChecklist(true);
    setTimeout(() => {
      setCopiedLink(false);
      setShowCopyChecklist(false);
    }, 4000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'revision_requested':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'revision_requested':
        return 'Edits Requested';
      default:
        return 'Pending';
    }
  };

  const getPlatformColors = (platform: string) => {
    const normalized = platform.toLowerCase();
    if (normalized.includes('instagram')) return { bg: '#fbeaf0', text: '#72243e' };
    if (normalized.includes('tiktok')) return { bg: '#eeedfe', text: '#3c3489' };
    if (normalized.includes('youtube')) return { bg: '#fcebeb', text: '#791f1f' };
    if (normalized.includes('linkedin')) return { bg: '#e6f1fb', text: '#0c447c' };
    if (normalized.includes('facebook')) return { bg: '#eaf3de', text: '#27500a' };
    if (normalized.includes('pinterest')) return { bg: '#faece7', text: '#712b13' };
    if (normalized.includes('twitter') || normalized.includes('x ')) return { bg: '#f1efe8', text: '#444441' };
    return { bg: '#f5f3f0', text: '#8C8479' };
  };

  const getCardColors = (post: CalendarPost) => {
    const cardColor = (post as any).card_color;
    if (cardColor) {
      const textColors: { [key: string]: string } = {
        '#fbeaf0': '#72243e',
        '#eeedfe': '#3c3489',
        '#fcebeb': '#791f1f',
        '#e6f1fb': '#0c447c',
        '#eaf3de': '#27500a',
        '#e1f5ee': '#0d5647',
        '#faeeda': '#854f0b',
        '#faece7': '#712b13',
      };
      return { bg: cardColor, text: textColors[cardColor] || '#1A1612' };
    }
    return getPlatformColors(post.platform || '');
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'approved':
        return '#639922';
      case 'revision_requested':
        return '#378add';
      default:
        return '#ef9f27';
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const getStatusCounts = () => {
    return {
      pending: posts.filter((p) => p.approval_status === 'pending').length,
      approved: posts.filter((p) => p.approval_status === 'approved').length,
      revisions: posts.filter((p) => p.approval_status === 'revision_requested').length,
    };
  };

  const counts = getStatusCounts();

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
    const dateStr = date.toISOString().split('T')[0];
    return posts.filter(post => {
      if (!post.scheduled_date) return false;
      const postDate = new Date(post.scheduled_date + 'T12:00:00');
      return postDate.toISOString().split('T')[0] === dateStr;
    });
  };

  const handleDateClick = (date: Date) => {
    const postsForDate = getPostsForDate(date);
    const dateStr = date.toISOString().split('T')[0];

    if (postsForDate.length > 0) {
      // Open modal with first post for this date
      setSelectedPost(postsForDate[0]);
    } else {
      // No posts, open sidebar to create new post
      setSelectedDate(date);
      setEditingPost(null);
      setFormData({
        platform: calendar.platforms?.[0] || 'Instagram',
        platforms: [calendar.platforms?.[0] || 'Instagram'],
        title: '',
        caption: '',
        image_url: '',
        video_url: '',
        thumbnail_url: '',
        media_type: '',
        scheduled_date: dateStr,
        card_color: '',
      });
    }
  };

  const closeEditor = () => {
    setSelectedDate(null);
    setEditingPost(null);
    setFormData({
      platform: calendar.platforms?.[0] || 'Instagram',
      platforms: [calendar.platforms?.[0] || 'Instagram'],
      title: '',
      caption: '',
      image_url: '',
      video_url: '',
      thumbnail_url: '',
      media_type: '',
      scheduled_date: '',
    });
  };

  const handleSaveTitle = async () => {
    if (!editedTitle.trim() || editedTitle === calendar.title) {
      setIsEditingTitle(false);
      setEditedTitle(calendar.title);
      return;
    }

    try {
      const { error } = await supabase
        .from('calendars')
        .update({ title: editedTitle.trim() })
        .eq('id', calendar.id);

      if (error) throw error;

      setCalendar({ ...calendar, title: editedTitle.trim() });
      setIsEditingTitle(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error updating title:', error);
      setEditedTitle(calendar.title);
      setIsEditingTitle(false);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setEditedTitle(calendar.title);
      setIsEditingTitle(false);
    }
  };

  const togglePlatform = (platform: string) => {
    const newPlatforms = formData.platforms.includes(platform)
      ? formData.platforms.filter(p => p !== platform)
      : [...formData.platforms, platform];

    setFormData({
      ...formData,
      platforms: newPlatforms,
      platform: newPlatforms[0] || calendar.platforms?.[0] || 'Instagram'
    });
  };

  const handleMediaChange = (url: string, type: 'image' | 'video') => {
    if (type === 'image') {
      setFormData({ ...formData, image_url: url, video_url: '', thumbnail_url: '', media_type: 'image' });
    } else {
      setFormData({ ...formData, video_url: url, image_url: '', media_type: 'video' });
    }
  };

  const handleThumbnailChange = (url: string) => {
    setFormData({ ...formData, thumbnail_url: url });
  };

  const handleMediaRemove = () => {
    setFormData({ ...formData, image_url: '', video_url: '', thumbnail_url: '', media_type: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const scheduledDateObj = new Date(formData.scheduled_date);
      const dayNumber = scheduledDateObj.getDate();

      if (editingPost) {
        const { error } = await supabase
          .from('calendar_posts')
          .update({
            platform: formData.platform,
            platforms: formData.platforms,
            title: formData.title,
            caption: formData.caption,
            image_url: formData.image_url || null,
            video_url: formData.video_url || null,
            thumbnail_url: formData.thumbnail_url || null,
            media_type: formData.media_type || null,
            scheduled_date: formData.scheduled_date,
            day_number: dayNumber,
            card_color: formData.card_color || null,
          })
          .eq('id', editingPost.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('calendar_posts')
          .insert({
            calendar_id: calendar.id,
            platform: formData.platform,
            platforms: formData.platforms,
            title: formData.title,
            caption: formData.caption,
            image_url: formData.image_url || null,
            video_url: formData.video_url || null,
            thumbnail_url: formData.thumbnail_url || null,
            media_type: formData.media_type || null,
            scheduled_date: formData.scheduled_date,
            day_number: dayNumber,
            approval_status: 'pending',
            card_color: formData.card_color || null,
          });

        if (error) throw error;
      }

      await loadData();
      if (onUpdate) onUpdate();
      closeEditor();
    } catch (error) {
      console.error('Error saving post:', error);
      alert('Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async () => {
    if (!editingPost) return;

    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase
        .from('calendar_posts')
        .delete()
        .eq('id', editingPost.id);

      if (error) throw error;

      await loadData();
      if (onUpdate) onUpdate();
      closeEditor();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A96E]"></div>
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

  return (
    <div className="flex h-screen bg-[#FAF8F4] overflow-hidden">

      {/* Main Calendar Panel */}
      <div className={`flex-1 overflow-y-auto p-6 transition-all duration-300 ${selectedDate ? '' : 'w-full'}`}>
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 text-sm transition-colors"
                  style={{
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#1a1a18'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#c8a84b'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#1a1a18'}
                >
                  ← Back to Dashboard
                </button>
              </div>
              {isEditingTitle ? (
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={handleTitleKeyDown}
                  autoFocus
                  className="text-3xl text-[#1A1612] mb-1 bg-transparent border-b-2 border-[#C9A96E] outline-none"
                  style={{ fontFamily: 'DM Serif Display, serif' }}
                />
              ) : (
                <h1
                  className="text-3xl text-[#1A1612] mb-1 cursor-pointer hover:text-[#C9A96E] transition-colors"
                  style={{ fontFamily: 'DM Serif Display, serif' }}
                  onClick={() => {
                    setIsEditingTitle(true);
                    setEditedTitle(calendar.title);
                  }}
                  title="Click to edit title"
                >
                  {calendar.title}
                </h1>
              )}
              <p className="text-[#8C8479] text-sm">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} — Click any date to add or edit a post
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex gap-3">
                <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: '#fdf5e6' }}>
                  <span className="text-sm font-semibold" style={{ color: '#c08b1f' }}>{counts.pending} Pending</span>
                </div>
                <div className="px-4 py-2 rounded-lg" style={{ backgroundColor: '#e8f5e9' }}>
                  <span className="text-sm font-semibold" style={{ color: '#2e7d32' }}>{counts.approved} Approved</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <ExportCalendar posts={posts} calendarTitle={calendar.title} />

            <button
              onClick={() => setShowGenerateCaptions(true)}
              className="btn-secondary flex items-center gap-2 text-xs px-3 py-2"
              style={{ color: '#C9A96E' }}
            >
              <Sparkles className="w-4 h-4" fill="#C9A96E" />
              AI Content Studio
            </button>

            <button
              onClick={() => setShowSendModal(true)}
              className="btn-secondary flex items-center gap-2 text-xs px-3 py-2"
            >
              <Mail className="w-4 h-4" />
              Send to Client
            </button>



            <button
              onClick={handleCopyShareLink}
              className="btn-secondary flex items-center gap-2 text-xs px-3 py-2"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Share Link
                </>
              )}
            </button>

            {showCopyChecklist && (
              <div className="absolute top-12 right-0 z-50 bg-white border border-[#E8E3DC] rounded-xl shadow-lg p-4 w-72">
                <p className="text-xs uppercase tracking-wider text-[#8C8479] font-medium mb-3">Your client will see:</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    {client?.brand_logo_url ? <span>✅</span> : <span>⚠️</span>}
                    <span style={{ color: client?.brand_logo_url ? '#1A1612' : '#8C8479' }}>
                      {client?.brand_logo_url ? 'Client logo added' : 'No logo — add one for a branded welcome screen'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {(client?.brand_colors?.primary || client?.primary_color) ? <span>✅</span> : <span>⚠️</span>}
                    <span style={{ color: (client?.brand_colors?.primary || client?.primary_color) ? '#1A1612' : '#8C8479' }}>
                      {(client?.brand_colors?.primary || client?.primary_color) ? 'Brand colors set' : 'No brand colors — add in Client Settings'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span>✅</span>
                    <span style={{ color: '#1A1612' }}>Welcome screen ready for first visit</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#E8E3DC]">
                  <p className="text-xs text-[#C9A96E] font-medium">✦ Link copied to clipboard!</p>
                </div>
              </div>
            )}

            <div className="relative">
              <button
                onClick={() => setShowReminderDropdown(!showReminderDropdown)}
                className="btn-secondary flex items-center gap-2 text-xs px-3 py-2"
                style={{ color: reminderSent ? '#639922' : reminderFrequency !== 'off' ? '#C9A96E' : undefined }}
              >
                {sendingReminder ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                {sendingReminder ? 'Sending...' : reminderSent ? 'Reminder Sent!' : 'Reminders'}
                {reminderFrequency !== 'off' && !sendingReminder && !reminderSent && (
                  <span style={{ fontSize: '10px', color: '#C9A96E' }}>ON</span>
                )}
                <span style={{ fontSize: '10px' }}>▾</span>
              </button>

              {showReminderDropdown && (
                <div className="absolute top-10 left-0 z-50 bg-white border border-[#E8E3DC] rounded-xl shadow-lg p-3 w-64">
                  <p className="text-xs uppercase tracking-wider text-[#8C8479] font-medium mb-3">Reminders</p>
                  <button
                    onClick={() => { handleSendReminder(); setShowReminderDropdown(false); }}
                    disabled={sendingReminder}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-[#FAF8F4] mb-1"
                    style={{ color: '#1A1612', fontWeight: 500 }}
                  >
                    📨 Send reminder now
                  </button>
                  <div className="border-t border-[#E8E3DC] pt-2 mb-1">
                    <p className="text-xs text-[#8C8479] px-3 pb-1">Auto-remind until approved:</p>
                  </div>
                  <div className="space-y-1">
                    {['off', '2 days', '3 days', '5 days', '1 week'].map(option => (
                      <button
                        key={option}
                        onClick={() => { setReminderFrequency(option); setShowReminderDropdown(false); }}
                        className="w-full text-left px-3 py-2 rounded-lg text-sm transition"
                        style={{
                          backgroundColor: reminderFrequency === option ? '#FAF8F4' : 'transparent',
                          color: reminderFrequency === option ? '#C9A96E' : '#1A1612',
                          fontWeight: reminderFrequency === option ? 600 : 400,
                        }}
                      >
                        {option === 'off' ? '🔕 Off' : `🔔 Every ${option}`}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#E8E3DC]">
                    <p className="text-xs text-[#8C8479]">
                      {reminderFrequency === 'off'
                        ? 'Turn on to automatically remind your client until all posts are approved.'
                        : `Client will be reminded every ${reminderFrequency} until all posts are approved. 🤎`}
                    </p>
                    <p className="text-xs text-[#C9A96E] mt-1 font-medium">⚡ Auto-remind coming soon</p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => window.open(`/share/${calendar.share_token}`, '_blank')}
              className="btn-secondary flex items-center gap-2 text-xs px-3 py-2"
            >
              <Eye className="w-4 h-4" />
              Preview as Client
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-[14px] border border-[#E8E3DC] p-6" style={{ boxShadow: '0 2px 8px rgba(26, 22, 18, 0.04)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-[#1A1612]">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={previousMonth}
                className="w-7 h-7 border border-[#E8E3DC] rounded-lg flex items-center justify-center text-[#8C8479] hover:border-[#C9A96E] hover:text-[#C9A96E] transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="w-7 h-7 border border-[#E8E3DC] rounded-lg flex items-center justify-center text-[#8C8479] hover:border-[#C9A96E] hover:text-[#C9A96E] transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-[10px] font-semibold text-[#8C8479] uppercase tracking-wider py-1">
                {day.charAt(0)}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dayPosts = getPostsForDate(date);
              const dateStr = date.toISOString().split('T')[0];
              const isSelected = selectedDate && selectedDate.toISOString().split('T')[0] === dateStr;
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
              const isTodayDate = isToday(date);

              return (
                <button
                  key={dateStr}
                  onClick={() => handleDateClick(date)}
                  className={`aspect-square rounded-[8px] border transition-all duration-200 p-1 flex flex-col items-start justify-start hover:border-[#C9A96E] bg-white ${
                    isSelected
                      ? 'border-[#c8a84b] border-2'
                      : isTodayDate
                      ? 'border-[#c8a84b] border-[1.5px]'
                      : 'border-[#ece6dc]'
                  } ${!isCurrentMonth ? 'opacity-30' : ''}`}
                >
                  <span className={`text-[11px] font-medium mb-1 px-1 ${isSelected || isTodayDate ? 'text-[#c8a84b]' : 'text-[#1A1612]'}`}>
                    {date.getDate()}
                  </span>

                  {dayPosts.length > 0 && (
                    <div className="w-full space-y-0.5 px-0.5">
                      {dayPosts.map((post) => {
                        const cardColors = getCardColors(post);
                        const statusDotColor = getStatusDotColor(post.approval_status || 'pending');

                        return (
                          <button
                            key={post.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPost(post);
                            }}
                            className="w-full text-left text-[8.5px] font-semibold px-[5px] py-[2px] rounded-[3px] truncate flex items-center gap-1"
                            style={{
                              backgroundColor: cardColors.bg,
                              color: cardColors.text,
                            }}
                          >
                            <div
                              className="w-[4px] h-[4px] rounded-full flex-shrink-0"
                              style={{ backgroundColor: statusDotColor }}
                            />
                            <span className="truncate">{post.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Panel - Post Editor */}
      {selectedDate && (
        <div className="w-[360px] bg-white border-l border-[#ece6dc] flex-shrink-0 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-[#E8E3DC] px-4 py-3 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-semibold text-[#1A1612]">
                {editingPost ? 'Edit Post' : 'Add Post'}
              </h2>
              <div
                className="px-2 py-0.5 rounded text-[10px] font-semibold"
                style={{ backgroundColor: '#faeeda', color: '#854f0b' }}
              >
                {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
            </div>
            <button
              onClick={closeEditor}
              className="p-1 hover:bg-[#FAF8F4] rounded transition-colors"
            >
              <X className="w-4 h-4 text-[#8C8479]" />
            </button>
          </div>

          <div className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-[#8C8479] uppercase tracking-wider mb-2">
                  Post Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E8E3DC] rounded-lg text-sm focus:ring-2 focus:ring-[#C9A96E] focus:border-transparent"
                  placeholder="e.g., Morning Glow Reel"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#8C8479] uppercase tracking-wider mb-2">
                  Platforms
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['Instagram', 'TikTok', 'YouTube', 'LinkedIn', 'Facebook', 'Pinterest'].map((platform) => (
                    <label
                      key={platform}
                      className={`flex items-center gap-2 px-2 py-1.5 border rounded-lg cursor-pointer transition-all text-xs ${
                        formData.platforms.includes(platform)
                          ? 'border-[#C9A96E] bg-[#FBF5EF]'
                          : 'border-[#E8E3DC] hover:border-[#C9A96E]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.platforms.includes(platform)}
                        onChange={() => togglePlatform(platform)}
                        className="w-3 h-3 text-[#C9A96E] rounded focus:ring-1 focus:ring-[#C9A96E]"
                      />
                      <span className="text-[#1A1612]">{platform}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#8C8479] uppercase tracking-wider mb-1">
                  Card Color
                </label>
                <p className="text-[9px] text-[#8C8479] mb-3">
                  Auto matches your platform. Override to group by content type.
                </p>
                <div className="flex gap-2 mb-3">
                  {[
                    { value: '', label: 'Auto', bg: 'linear-gradient(135deg, #fbeaf0 0%, #eeedfe 25%, #e6f1fb 50%, #eaf3de 75%, #faeeda 100%)', border: '1.5px dashed #C9A96E' },
                    { value: '#fbeaf0', label: 'Pink', bg: '#fbeaf0' },
                    { value: '#eeedfe', label: 'Purple', bg: '#eeedfe' },
                    { value: '#fcebeb', label: 'Red', bg: '#fcebeb' },
                    { value: '#e6f1fb', label: 'Blue', bg: '#e6f1fb' },
                    { value: '#eaf3de', label: 'Green', bg: '#eaf3de' },
                    { value: '#e1f5ee', label: 'Teal', bg: '#e1f5ee' },
                    { value: '#faeeda', label: 'Amber', bg: '#faeeda' },
                    { value: '#faece7', label: 'Coral', bg: '#faece7' },
                  ].map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, card_color: color.value })}
                      className="w-6 h-6 rounded-full transition-all flex-shrink-0"
                      style={{
                        background: color.bg,
                        border: formData.card_color === color.value
                          ? '2px solid #1a1a18'
                          : color.border || '1px solid #E8E3DC',
                        transform: formData.card_color === color.value ? 'scale(1.1)' : 'scale(1)',
                      }}
                      title={color.label}
                    />
                  ))}
                </div>
                <div className="bg-[#FAF8F4] rounded-lg px-3 py-2 mb-3">
                  <div className="flex items-center gap-2 text-xs">
                    <div
                      className="w-4 h-4 rounded flex-shrink-0"
                      style={{
                        background: formData.card_color
                          ? formData.card_color
                          : 'linear-gradient(135deg, #fbeaf0 0%, #eeedfe 25%, #e6f1fb 50%, #eaf3de 75%, #faeeda 100%)',
                      }}
                    />
                    <span className="text-[#1A1612]">
                      <span className="font-medium">Color:</span>{' '}
                      {formData.card_color === '' && 'Auto (matches platform)'}
                      {formData.card_color === '#fbeaf0' && 'Lifestyle / Brand'}
                      {formData.card_color === '#eeedfe' && 'Video / Reels'}
                      {formData.card_color === '#fcebeb' && 'Campaigns'}
                      {formData.card_color === '#e6f1fb' && 'Promotional'}
                      {formData.card_color === '#eaf3de' && 'Evergreen'}
                      {formData.card_color === '#e1f5ee' && 'Events'}
                      {formData.card_color === '#faeeda' && 'Promotional'}
                      {formData.card_color === '#faece7' && 'Events'}
                    </span>
                  </div>
                </div>
                <div className="text-[9px] text-[#8C8479] uppercase tracking-wider mb-2 font-semibold">
                  Color Guide
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#fbeaf0' }} />
                    <span className="text-[#1A1612]">Lifestyle / Brand</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#eeedfe' }} />
                    <span className="text-[#1A1612]">Video / Reels</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#e1f5ee' }} />
                    <span className="text-[#1A1612]">Campaigns</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#faeeda' }} />
                    <span className="text-[#1A1612]">Promotional</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#eaf3de' }} />
                    <span className="text-[#1A1612]">Evergreen</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#faece7' }} />
                    <span className="text-[#1A1612]">Events</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#E8E3DC] pt-4"></div>

              <div>
                <label className="block text-[10px] font-semibold text-[#8C8479] uppercase tracking-wider mb-2">
                  Upload Image
                </label>
                <MediaUpload
                  imageValue={formData.image_url}
                  videoValue=""
                  onChange={handleMediaChange}
                  onRemove={handleMediaRemove}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-[#8C8479] uppercase tracking-wider mb-2">
                  Or Add Video Link
                </label>
                <MediaLinkInput
                  imageValue=""
                  videoValue={formData.video_url}
                  thumbnailValue={formData.thumbnail_url}
                  onChange={handleMediaChange}
                  onThumbnailChange={handleThumbnailChange}
                  onRemove={handleMediaRemove}
                />
              </div>

              <div className="border-t border-[#E8E3DC] pt-4"></div>

              <div>
                <label className="block text-[10px] font-semibold text-[#8C8479] uppercase tracking-wider mb-2">
                  Caption
                </label>
                <textarea
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E8E3DC] rounded-lg text-sm focus:ring-2 focus:ring-[#C9A96E] focus:border-transparent"
                  rows={6}
                  placeholder="Write your caption here..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving || formData.platforms.length === 0}
                className="w-full px-4 py-2.5 bg-[#1a1a18] text-white text-sm font-semibold rounded-lg hover:brightness-110 transition-all disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingPost ? 'Save Post' : 'Save Post'}
              </button>

              {editingPost && (
                <button
                  type="button"
                  onClick={handleDeletePost}
                  className="w-full px-4 py-2 border border-red-300 text-red-700 text-sm rounded-lg hover:bg-red-50 transition-colors"
                >
                  Delete Post
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {selectedPost && !selectedDate && (
        <PostDetailModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onUpdate={loadData}
          onEdit={(post) => {
            // Close modal and open sidebar editor
            setSelectedPost(null);
            const dateStr = post.scheduled_date || new Date().toISOString().split('T')[0];
            setSelectedDate(new Date(dateStr + 'T12:00:00'));
            setEditingPost(post);
            setFormData({
              platform: post.platform || calendar.platforms?.[0] || 'Instagram',
              platforms: post.platforms || [post.platform || calendar.platforms?.[0] || 'Instagram'],
              title: post.title || '',
              caption: post.caption || '',
              image_url: post.image_url || '',
              video_url: post.video_url || '',
              thumbnail_url: post.thumbnail_url || '',
              media_type: post.media_type || '',
              scheduled_date: dateStr,
              card_color: (post as any).card_color || '',
            });
          }}
          brandName={client?.name}
          brandLogoUrl={client?.brand_logo_url}
          mockupLogoUrl={client?.mockup_logo_url}
          brandColors={client?.brand_colors}
          darkMode={false}
        />
      )}

      {showPostCreator && (
        <PostCreator
          calendarId={calendar.id}
          platforms={calendar.platforms}
          brandName={client?.name}
          brandLogoUrl={client?.brand_logo_url}
          calendarCreatedAt={calendar.created_at}
          onClose={() => setShowPostCreator(false)}
          onSuccess={() => {
            loadData();
            if (onUpdate) onUpdate();
          }}
        />
      )}

      {showGenerateCaptions && (
        <AIContentStudio
          calendarId={calendar.id}
          calendarTitle={calendar.title}
          clientName={client?.name || calendar.title}
          clientNotes={client?.notes}
          clientDNA={client?.brand_dna}
          platforms={calendar.platforms || ['Instagram']}
          primaryColor={client?.brand_colors?.primary || client?.primary_color || '#C9A96E'}
          onClose={() => setShowGenerateCaptions(false)}
          onPostsAdded={() => { loadData(); setShowGenerateCaptions(false); }}
        />
      )}

      {showSendModal && client && (
        <SendToClientModal
          calendarId={calendar.id}
          calendarTitle={calendar.title}
          clientName={client.name}
          month={calendar.title.split(' ')[0] || 'Content'}
          shareToken={calendar.share_token || ''}
          logoUrl={client.brand_logo_url}
          onClose={() => setShowSendModal(false)}
        />
      )}
    </div>
  );
}
