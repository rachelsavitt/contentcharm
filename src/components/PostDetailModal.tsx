import { useState } from 'react';
import { CalendarPost, supabase } from '../lib/supabase';
import { X, ThumbsUp, MessageSquare, CreditCard as Edit2, Save } from 'lucide-react';
import { SocialMediaMockup } from './SocialMediaMockup';
import { MediaUpload } from './MediaUpload';
import { MediaLinkInput } from './MediaLinkInput';
import confetti from 'canvas-confetti';

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

interface PostDetailModalProps {
  post: CalendarPost;
  onClose: () => void;
  onUpdate: () => void;
  onEdit?: (post: CalendarPost) => void;
  isClientView?: boolean;
  brandName?: string;
  brandLogoUrl?: string;
  mockupLogoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  brandColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  darkMode?: boolean;
}

export function PostDetailModal({
  post,
  onClose,
  onUpdate,
  onEdit,
  isClientView = false,
  brandName,
  brandLogoUrl,
  mockupLogoUrl,
  primaryColor,
  secondaryColor,
  brandColors,
  darkMode = false,
}: PostDetailModalProps) {
  // Use primary/secondary colors if provided, otherwise fall back to brandColors object
  const effectivePrimaryColor = primaryColor || brandColors?.primary || '#7C9E8A';
  const effectiveSecondaryColor = secondaryColor || brandColors?.secondary || '#C9A96E';
  const effectiveBrandColors = {
    primary: effectivePrimaryColor,
    secondary: effectiveSecondaryColor,
    accent: effectiveSecondaryColor
  };
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(post.client_feedback || '');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedReactions, setSelectedReactions] = useState<string[]>(
    Array.isArray((post as any).reactions) ? (post as any).reactions : []
  );
  const [editedPost, setEditedPost] = useState({
    title: post.title,
    caption: post.caption || '',
    image_url: post.image_url || '',
    video_url: post.video_url || '',
    thumbnail_url: post.thumbnail_url || '',
    media_type: post.media_type || ('' as 'image' | 'video' | ''),
    scheduled_date: post.scheduled_date || '',
    platforms: (post as any).platforms || [post.platform],
    platform: (post as any).platforms?.[0] || post.platform,
  });

  const handleMediaChange = (url: string, type: 'image' | 'video') => {
    if (type === 'image') {
      setEditedPost({ ...editedPost, image_url: url, video_url: '', thumbnail_url: '', media_type: 'image' });
    } else {
      setEditedPost({ ...editedPost, video_url: url, image_url: '', media_type: 'video' });
    }
  };

  const handleThumbnailChange = (url: string) => {
    setEditedPost({ ...editedPost, thumbnail_url: url });
  };

  const handleMediaRemove = () => {
    setEditedPost({ ...editedPost, image_url: '', video_url: '', thumbnail_url: '', media_type: '' });
  };

  const togglePlatform = (platform: string) => {
    const newPlatforms = editedPost.platforms.includes(platform)
      ? editedPost.platforms.filter((p: string) => p !== platform)
      : [...editedPost.platforms, platform];

    setEditedPost({
      ...editedPost,
      platforms: newPlatforms,
      platform: newPlatforms[0] || editedPost.platform
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('calendar_posts')
        .update({
          title: editedPost.title,
          caption: editedPost.caption,
          image_url: editedPost.image_url || null,
          video_url: editedPost.video_url || null,
          thumbnail_url: editedPost.thumbnail_url || null,
          media_type: editedPost.media_type || null,
          scheduled_date: editedPost.scheduled_date || null,
          platforms: editedPost.platforms,
          platform: editedPost.platform,
        })
        .eq('id', post.id);

      if (error) throw error;

      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16) / 255,
          g: parseInt(result[2], 16) / 255,
          b: parseInt(result[3], 16) / 255,
        }
      : { r: 0.5, g: 0.6, b: 0.5 };
  };

  const triggerConfetti = () => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const primaryColor = hexToRgb(effectivePrimaryColor);
    const secondaryColorHex = effectiveSecondaryColor || '#C9A96E';
    const secondaryColor = hexToRgb(secondaryColorHex);

    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: [
        // 40% primary
        `rgb(${primaryColor.r * 255}, ${primaryColor.g * 255}, ${primaryColor.b * 255})`,
        `rgb(${primaryColor.r * 255}, ${primaryColor.g * 255}, ${primaryColor.b * 255})`,
        `rgb(${primaryColor.r * 255}, ${primaryColor.g * 255}, ${primaryColor.b * 255})`,
        `rgb(${primaryColor.r * 255}, ${primaryColor.g * 255}, ${primaryColor.b * 255})`,
        // 30% secondary
        `rgb(${secondaryColor.r * 255}, ${secondaryColor.g * 255}, ${secondaryColor.b * 255})`,
        `rgb(${secondaryColor.r * 255}, ${secondaryColor.g * 255}, ${secondaryColor.b * 255})`,
        `rgb(${secondaryColor.r * 255}, ${secondaryColor.g * 255}, ${secondaryColor.b * 255})`,
        // 20% gold
        '#C9A96E',
        '#C9A96E',
        // 10% white
        '#FFFFFF',
      ],
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        spread: 120,
        startVelocity: 55,
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  };

  const toggleReaction = async (emoji: string) => {
    const newReactions = selectedReactions.includes(emoji)
      ? selectedReactions.filter((r) => r !== emoji)
      : [...selectedReactions, emoji];

    setSelectedReactions(newReactions);

    // Save to database immediately
    try {
      const { error } = await supabase
        .from('calendar_posts')
        .update({ reactions: newReactions })
        .eq('id', post.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving reaction:', error);
      // Revert on error
      setSelectedReactions(selectedReactions);
    }
  };

  const handleApprove = async () => {
    try {
      const { error } = await supabase
        .from('calendar_posts')
        .update({
          approval_status: 'approved',
          client_feedback: feedback,
          reactions: selectedReactions,
        })
        .eq('id', post.id);

      if (error) throw error;

      triggerConfetti();

      setShowSuccessMessage(true);
      setTimeout(() => {
        setShowSuccessMessage(false);
        onUpdate();
        onClose();
      }, 2500);
    } catch (error) {
      console.error('Error approving post:', error);
      alert('Failed to approve post');
    }
  };

  const handleRequestEdits = async () => {
    if (!feedback.trim()) {
      alert('Please provide feedback for the edits you need');
      return;
    }

    try {
      const { error } = await supabase
        .from('calendar_posts')
        .update({
          approval_status: 'revision_requested',
          client_feedback: feedback,
        })
        .eq('id', post.id);

      if (error) throw error;
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error requesting edits:', error);
      alert('Failed to request edits');
    }
  };

  const extractHashtags = (text: string) => {
    const parts = text.split(/(#\w+)/g);
    return parts;
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 sm:p-6 lg:p-8 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {showSuccessMessage && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[60] bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 duration-500 font-bold text-lg flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          Post approved! Great work!
          <span className="text-2xl">🎉</span>
        </div>
      )}

      <div
        className="bg-white rounded-[18px] max-w-7xl w-full my-8 shadow-2xl animate-in slide-in-from-bottom-4 duration-500 max-h-[90vh] overflow-y-auto"
        style={{
          background: isEditing ? `linear-gradient(to bottom right, ${effectiveBrandColors.primary}08, ${effectiveBrandColors.secondary}12, transparent)` : '#fff',
        }}
      >
        <div
          className="border-b px-8 md:px-12 py-6 md:py-8 flex items-center justify-between"
          style={{
            backgroundColor: isEditing ? (darkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.95)') : '#fff',
            borderColor: isEditing ? (darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(229,231,235,0.5)') : '#f0f0f0'
          }}
        >
          <div className="flex flex-wrap items-center gap-3 md:gap-4">
            <h2
              className="text-[20px] font-bold"
              style={{
                fontFamily: 'Inter, system-ui',
                color: '#1a1a18'
              }}
            >
              {post.title}
            </h2>
            {(post as any).platforms && (post as any).platforms.length > 0 ? (
              <>
                {(post as any).platforms.map((platform: string) => {
                  const platformColors: Record<string, { bg: string; text: string }> = {
                    'Instagram': { bg: '#fbeaf0', text: '#72243e' },
                    'TikTok': { bg: '#eaf3fb', text: '#1e3a5f' },
                  };
                  const colors = platformColors[platform] || { bg: '#f0ebe3', text: '#4a4a4a' };
                  return (
                    <span
                      key={platform}
                      className="px-3 py-1.5 rounded-full text-[11px] font-semibold"
                      style={{
                        backgroundColor: colors.bg,
                        color: colors.text,
                      }}
                    >
                      {platform}
                    </span>
                  );
                })}
              </>
            ) : (
              <span
                className="px-3 py-1.5 rounded-full text-[11px] font-semibold"
                style={{
                  backgroundColor: '#fbeaf0',
                  color: '#72243e',
                }}
              >
                {post.platform}
              </span>
            )}
            {post.scheduled_date && !isEditing && (
              <span className="text-[11px]" style={{ color: '#aaa' }}>
                {new Date(post.scheduled_date + 'T12:00:00').toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            )}
            {!isEditing && post.approval_status === 'approved' && (
              <span
                className="px-3 py-1.5 rounded-full text-[11px] font-semibold"
                style={{
                  backgroundColor: '#eaf3de',
                  color: '#27500a',
                }}
              >
                Approved
              </span>
            )}
            {!isEditing && post.approval_status === 'revision_requested' && (
              <span
                className="px-3 py-1.5 rounded-full text-[11px] font-semibold"
                style={{
                  backgroundColor: '#fbeaf0',
                  color: '#72243e',
                }}
              >
                Edits Requested
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!isClientView && !isEditing && (
              <button
                onClick={() => {
                  if (onEdit) {
                    onEdit(post);
                  } else {
                    setIsEditing(true);
                  }
                }}
                className="px-4 py-[7px] bg-white border rounded-lg text-[12px] font-semibold transition-all hover:bg-gray-50 flex items-center gap-2"
                style={{
                  borderColor: '#ece6dc',
                  color: '#333'
                }}
              >
                ✏️ Edit
              </button>
            )}
            {isEditing && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 rounded-xl text-white font-bold flex items-center gap-2 disabled:opacity-50 shadow-2xl transition-all duration-300 hover:scale-105 hover:brightness-110"
                style={{
                  background: `linear-gradient(to right, ${effectiveBrandColors.primary}, ${effectiveBrandColors.secondary})`
                }}
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}
            <button
              onClick={onClose}
              className="transition-all duration-300 hover:opacity-70 p-1"
              style={{
                color: '#999'
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isEditing ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.2fr] gap-8 md:gap-12 p-8 md:p-12 pt-10">
            <div className="space-y-8 order-2 lg:order-1">
              <div>
                <h3
                  className="text-2xl md:text-3xl font-black mb-8 text-gray-900"
                  style={{ fontFamily: 'var(--font-heading), system-ui' }}
                >
                  Post Details
                </h3>
                <div className="space-y-6 bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editedPost.title}
                      onChange={(e) => setEditedPost({ ...editedPost, title: e.target.value })}
                      className="w-full px-5 py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white border-gray-300 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Platforms (Select one or more)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {ALL_PLATFORMS.map((platform) => (
                        <label
                          key={platform}
                          className={`flex items-center gap-2 px-3 py-2 border-2 rounded-lg cursor-pointer transition-all ${
                            editedPost.platforms.includes(platform)
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:border-gray-400 bg-white text-gray-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={editedPost.platforms.includes(platform)}
                            onChange={() => togglePlatform(platform)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                          />
                          <span className="font-medium text-sm">{platform}</span>
                        </label>
                      ))}
                    </div>
                    {editedPost.platforms.length === 0 && (
                      <p className="text-xs text-red-600 mt-2">Please select at least one platform</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Scheduled Date
                    </label>
                    <input
                      type="date"
                      value={editedPost.scheduled_date}
                      onChange={(e) => setEditedPost({ ...editedPost, scheduled_date: e.target.value })}
                      className="w-full px-5 py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white border-gray-300 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Upload Image
                    </label>
                    <p className="text-xs text-gray-600 mb-2">Upload images directly (max 5MB)</p>
                    <MediaUpload
                      imageValue={editedPost.image_url}
                      videoValue=""
                      onChange={handleMediaChange}
                      onRemove={handleMediaRemove}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Or Add Video Link
                    </label>
                    <p className="text-xs text-gray-600 mb-2">For videos, paste a link from YouTube, Vimeo, or Google Drive</p>
                    <MediaLinkInput
                      imageValue=""
                      videoValue={editedPost.video_url}
                      thumbnailValue={editedPost.thumbnail_url}
                      onChange={handleMediaChange}
                      onThumbnailChange={handleThumbnailChange}
                      onRemove={handleMediaRemove}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Caption
                    </label>
                    <textarea
                      value={editedPost.caption}
                      onChange={(e) => setEditedPost({ ...editedPost, caption: e.target.value })}
                      className="w-full px-5 py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 bg-white border-gray-300 text-gray-900"
                      rows={10}
                    />
                  </div>
                </div>
              </div>

            {isClientView && (
              <div className="border-t pt-8 mt-6" style={{ borderColor: darkMode ? '#3A3530' : '#E5E7EB' }}>
                <h3
                  className="text-2xl font-black mb-6"
                  style={{
                    fontFamily: 'var(--font-heading), system-ui',
                    color: darkMode ? '#FFFFFF' : '#111827'
                  }}
                >
                  Quick Reactions
                </h3>
                <div className="flex flex-wrap gap-2 mb-8">
                  {[
                    { emoji: '❤️', label: 'Love it' },
                    { emoji: '🔥', label: 'Fire' },
                    { emoji: '💯', label: 'Perfect' },
                    { emoji: '🤔', label: 'Not sure' },
                  ].map(({ emoji, label }) => (
                    <button
                      key={emoji}
                      onClick={() => toggleReaction(emoji)}
                      className="px-4 py-2 rounded-full text-base font-medium transition-all duration-300 hover:scale-105"
                      style={{
                        backgroundColor: selectedReactions.includes(emoji)
                          ? `${effectivePrimaryColor}26`
                          : darkMode ? 'rgba(255,255,255,0.1)' : '#F1EFE8',
                        border: selectedReactions.includes(emoji)
                          ? `1px solid ${effectivePrimaryColor}`
                          : darkMode ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
                        color: selectedReactions.includes(emoji)
                          ? effectivePrimaryColor
                          : darkMode ? 'rgba(255,255,255,0.8)' : '#8C8479',
                      }}
                    >
                      <span className="mr-1.5">{emoji}</span>
                      {label}
                    </button>
                  ))}
                </div>

                <h3
                  className="text-2xl font-black mb-6"
                  style={{
                    fontFamily: 'var(--font-heading), system-ui',
                    color: darkMode ? '#FFFFFF' : '#111827'
                  }}
                >
                  Your Feedback
                </h3>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className={`w-full px-6 py-5 backdrop-blur-lg border rounded-xl focus:ring-2 transition-all duration-300 text-lg ${darkMode ? 'placeholder-white/50' : 'placeholder-gray-500'}`}
                  style={{
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.6)',
                    borderColor: darkMode ? 'rgba(255,255,255,0.2)' : '#D1D5DB',
                    color: darkMode ? '#FFFFFF' : '#111827',
                  }}
                  rows={6}
                  placeholder="Add your comments or feedback here..."
                />

                <div className="flex flex-col gap-4 mt-8">
                  <button
                    onClick={handleApprove}
                    className="w-full flex items-center justify-center gap-3 px-12 py-6 text-white rounded-2xl shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:brightness-110 font-bold text-xl"
                    style={{
                      background: effectivePrimaryColor
                    }}
                  >
                    <ThumbsUp className="w-7 h-7" />
                    Approve Post
                  </button>
                  <button
                    onClick={handleRequestEdits}
                    className="w-full flex items-center justify-center gap-3 px-12 py-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-amber-500/50 hover:brightness-110 font-bold text-xl"
                  >
                    <MessageSquare className="w-7 h-7" />
                    Request Edits
                  </button>
                </div>
              </div>
            )}

            {!isClientView && (
              <div className="border-t border-gray-200 pt-8 mt-6">
                {selectedReactions.length > 0 && (
                  <div className="mb-6">
                    <h3
                      className="text-xl font-black text-gray-900 mb-3"
                      style={{ fontFamily: 'var(--font-heading), system-ui' }}
                    >
                      Client Reactions
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedReactions.map((emoji) => (
                        <span
                          key={emoji}
                          className="text-2xl"
                        >
                          {emoji}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <h3
                  className="text-2xl font-black text-gray-900 mb-4"
                  style={{ fontFamily: 'var(--font-heading), system-ui' }}
                >
                  💬 Client Feedback
                </h3>
                {post.client_feedback ? (
                  <div className="backdrop-blur-lg rounded-2xl p-6 border-l-4 shadow-xl bg-amber-50 border-amber-500 text-amber-900">
                    <p className="whitespace-pre-wrap text-lg leading-relaxed font-medium">{post.client_feedback}</p>
                  </div>
                ) : (
                  <div className="backdrop-blur-lg rounded-2xl p-6 border-l-4 shadow-xl bg-gray-50 border-gray-300 text-gray-500">
                    <p className="text-lg leading-relaxed italic">No feedback yet from the client.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="order-1 lg:order-2 flex flex-col">
            <h3
              className="text-2xl md:text-3xl font-black mb-8 text-gray-900"
              style={{ fontFamily: 'var(--font-heading), system-ui' }}
              >
              Social Media Preview
            </h3>
            <div className="flex-1 flex items-start justify-center lg:sticky lg:top-6 transition-all duration-300 hover:scale-[1.01]">
              <div className="w-full max-w-md mx-auto">
                <SocialMediaMockup
                  platform={post.platform}
                  imageUrl={isEditing ? editedPost.image_url : post.image_url}
                  videoUrl={isEditing ? editedPost.video_url : post.video_url}
                  mediaType={isEditing ? editedPost.media_type : post.media_type}
                  caption={isEditing ? editedPost.caption : (post.caption || '')}
                  brandName={brandName}
                  brandLogoUrl={brandLogoUrl}
                  mockupLogoUrl={mockupLogoUrl}
                  effectiveBrandColors={effectiveBrandColors}
                />
              </div>
            </div>
          </div>
        </div>
        ) : !isClientView ? (
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 border-r" style={{ borderColor: '#f0ebe3' }}>
              <div className="mb-6">
                <div className="text-[9px] uppercase font-semibold mb-2" style={{ color: '#bbb', letterSpacing: '1px', fontWeight: 600 }}>
                  POST IMAGE
                </div>
                {(post.image_url || post.video_url) ? (
                  <div
                    className="rounded-xl overflow-hidden mb-4"
                    style={{
                      height: '160px',
                      backgroundColor: '#f7f3ed'
                    }}
                  >
                    {post.media_type === 'video' && post.video_url ? (
                      post.thumbnail_url ? (
                        <img
                          src={post.thumbnail_url}
                          alt="Video thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <div className="text-4xl mb-2">▶️</div>
                            <div className="text-sm">Video</div>
                          </div>
                        </div>
                      )
                    ) : post.image_url ? (
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                ) : (
                  <div
                    className="rounded-xl overflow-hidden mb-4 flex items-center justify-center"
                    style={{
                      height: '160px',
                      backgroundColor: '#f7f3ed'
                    }}
                  >
                    <div className="text-center text-gray-400">
                      <div className="text-4xl mb-2">🖼️</div>
                      <div className="text-sm">No image uploaded</div>
                    </div>
                  </div>
                )}
                <div className="text-[9px] uppercase font-semibold mb-2" style={{ color: '#bbb', letterSpacing: '1px', fontWeight: 600 }}>
                  CAPTION
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">
                  {post.caption || 'No caption'}
                </p>
              </div>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <div className="text-[9px] uppercase font-semibold mb-3" style={{ color: '#bbb', letterSpacing: '1px', fontWeight: 600 }}>
                  CLIENT REACTIONS
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { emoji: '❤️', label: 'Love it' },
                    { emoji: '🔥', label: 'Fire' },
                    { emoji: '💯', label: 'Perfect' },
                    { emoji: '🤔', label: 'Not sure' },
                  ].map(({ emoji, label }) => (
                    <div
                      key={emoji}
                      className="px-4 py-2 rounded-full text-sm font-medium border"
                      style={{
                        backgroundColor: selectedReactions.includes(emoji) ? '#faeeda' : '#f9f9f9',
                        borderColor: selectedReactions.includes(emoji) ? '#c8a84b' : '#e5e5e5',
                        color: selectedReactions.includes(emoji) ? '#854f0b' : '#999',
                      }}
                    >
                      <span className="mr-1.5">{emoji}</span>
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="text-[9px] uppercase font-semibold mb-3" style={{ color: '#bbb', letterSpacing: '1px', fontWeight: 600 }}>
                  CLIENT FEEDBACK
                </div>
                <div
                  className="px-4 py-3 rounded-lg text-sm"
                  style={{
                    backgroundColor: '#faf8f3',
                    color: post.client_feedback ? '#666' : '#999',
                    border: '1px solid #f0ebe3',
                    fontStyle: post.client_feedback ? 'normal' : 'italic'
                  }}
                >
                  {post.client_feedback || 'No feedback yet from the client.'}
                </div>
              </div>

              <div className="mb-6">
                <div className="text-[9px] uppercase font-semibold mb-3" style={{ color: '#bbb', letterSpacing: '1px', fontWeight: 600 }}>
                  APPROVAL STATUS
                </div>
                {post.approval_status === 'approved' && (
                  <div
                    className="px-4 py-2 rounded-lg text-sm font-semibold inline-block"
                    style={{
                      backgroundColor: '#eaf3de',
                      color: '#27500a'
                    }}
                  >
                    ✓ Approved by client
                  </div>
                )}
                {post.approval_status === 'revision_requested' && (
                  <div
                    className="px-4 py-2 rounded-lg text-sm font-semibold inline-block"
                    style={{
                      backgroundColor: '#fbeaf0',
                      color: '#72243e'
                    }}
                  >
                    ✏️ Edits Requested
                  </div>
                )}
                {(!post.approval_status || post.approval_status === 'pending') && (
                  <div
                    className="px-4 py-2 rounded-lg text-sm font-semibold inline-block"
                    style={{
                      backgroundColor: '#faeeda',
                      color: '#854f0b'
                    }}
                  >
                    ⏱ Pending Review
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 border-r" style={{ borderColor: '#f0ebe3' }}>
              <div className="mb-6">
                <div className="text-[9px] uppercase font-semibold mb-2" style={{ color: '#bbb', letterSpacing: '1px', fontWeight: 600 }}>
                  POST IMAGE
                </div>
                {(post.image_url || post.video_url) ? (
                  <div
                    className="rounded-xl overflow-hidden mb-4"
                    style={{
                      height: '160px',
                      backgroundColor: '#f7f3ed'
                    }}
                  >
                    {post.media_type === 'video' && post.video_url ? (
                      post.thumbnail_url ? (
                        <img
                          src={post.thumbnail_url}
                          alt="Video thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <div className="text-center">
                            <div className="text-4xl mb-2">▶️</div>
                            <div className="text-sm">Video</div>
                          </div>
                        </div>
                      )
                    ) : post.image_url ? (
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                ) : (
                  <div
                    className="rounded-xl overflow-hidden mb-4 flex items-center justify-center"
                    style={{
                      height: '160px',
                      backgroundColor: '#f7f3ed'
                    }}
                  >
                    <div className="text-center text-gray-400">
                      <div className="text-4xl mb-2">🖼️</div>
                      <div className="text-sm">No image uploaded</div>
                    </div>
                  </div>
                )}
                <div className="text-[9px] uppercase font-semibold mb-2" style={{ color: '#bbb', letterSpacing: '1px', fontWeight: 600 }}>
                  CAPTION
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">
                  {post.caption || 'No caption'}
                </p>
              </div>
            </div>

            <div className="p-8">
              <div className="mb-6">
                <div className="text-[9px] uppercase font-semibold mb-3" style={{ color: '#bbb', letterSpacing: '1px', fontWeight: 600 }}>
                  QUICK REACTIONS
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { emoji: '❤️', label: 'Love it' },
                    { emoji: '🔥', label: 'Fire' },
                    { emoji: '💯', label: 'Perfect' },
                    { emoji: '🤔', label: 'Not sure' },
                  ].map(({ emoji, label }) => (
                    <button
                      key={emoji}
                      onClick={() => toggleReaction(emoji)}
                      className="px-4 py-2 rounded-full text-sm font-medium border transition-all"
                      style={{
                        backgroundColor: selectedReactions.includes(emoji) ? '#faeeda' : '#f9f9f9',
                        borderColor: selectedReactions.includes(emoji) ? '#c8a84b' : '#e5e5e5',
                        color: selectedReactions.includes(emoji) ? '#854f0b' : '#999',
                      }}
                    >
                      <span className="mr-1.5">{emoji}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="text-[9px] uppercase font-semibold mb-3" style={{ color: '#bbb', letterSpacing: '1px', fontWeight: 600 }}>
                  YOUR FEEDBACK
                </div>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg text-sm border resize-none"
                  style={{
                    backgroundColor: '#faf8f3',
                    borderColor: '#f0ebe3',
                    color: '#666'
                  }}
                  rows={4}
                  placeholder="Share your thoughts..."
                />
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleApprove}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:brightness-95"
                  style={{
                    backgroundColor: '#eaf3de',
                    color: '#27500a'
                  }}
                >
                  👍 Approve
                </button>
                <button
                  onClick={handleRequestEdits}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:brightness-95"
                  style={{
                    backgroundColor: '#fbeaf0',
                    color: '#72243e'
                  }}
                >
                  ✏️ Edits
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
