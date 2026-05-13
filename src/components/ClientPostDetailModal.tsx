import { useState } from 'react';
import { CalendarPost, supabase } from '../lib/supabase';
import { X, ThumbsUp, MessageSquare, Check, Calendar as CalendarIcon } from 'lucide-react';
import { MediaPreview } from './MediaPreview';
import confetti from 'canvas-confetti';

interface ClientPostDetailModalProps {
  post: CalendarPost;
  onClose: () => void;
  onUpdate: () => void;
  brandName?: string;
  brandLogoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export function ClientPostDetailModal({
  post,
  onClose,
  onUpdate,
  brandName,
  primaryColor = '#7C9E8A',
  secondaryColor = '#C9A96E',
}: ClientPostDetailModalProps) {
  const [feedback, setFeedback] = useState(post.client_feedback || '');
  const [selectedReactions, setSelectedReactions] = useState<string[]>(
    Array.isArray((post as any).reactions) ? (post as any).reactions : []
  );
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const primaryRgb = hexToRgb(primaryColor);
    const secondaryRgb = hexToRgb(secondaryColor);

    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: [
        `rgb(${primaryRgb.r * 255}, ${primaryRgb.g * 255}, ${primaryRgb.b * 255})`,
        `rgb(${primaryRgb.r * 255}, ${primaryRgb.g * 255}, ${primaryRgb.b * 255})`,
        `rgb(${primaryRgb.r * 255}, ${primaryRgb.g * 255}, ${primaryRgb.b * 255})`,
        `rgb(${secondaryRgb.r * 255}, ${secondaryRgb.g * 255}, ${secondaryRgb.b * 255})`,
        `rgb(${secondaryRgb.r * 255}, ${secondaryRgb.g * 255}, ${secondaryRgb.b * 255})`,
        '#C9A96E',
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

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  };

  const toggleReaction = async (emoji: string) => {
    const newReactions = selectedReactions.includes(emoji)
      ? selectedReactions.filter((r) => r !== emoji)
      : [...selectedReactions, emoji];

    setSelectedReactions(newReactions);

    try {
      const { error } = await supabase
        .from('calendar_posts')
        .update({ reactions: newReactions })
        .eq('id', post.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error saving reaction:', error);
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

  const handleDecline = async () => {
    if (!feedback.trim()) {
      alert('Please provide feedback for why you\'re declining this post');
      return;
    }

    try {
      const { error } = await supabase
        .from('calendar_posts')
        .update({
          approval_status: 'declined',
          client_feedback: feedback,
        })
        .eq('id', post.id);

      if (error) throw error;
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error declining post:', error);
      alert('Failed to decline post');
    }
  };

  const platforms = (post as any).platforms || [post.platform];
  const hasMedia = post.image_url || post.video_url;
  const isApproved = post.approval_status === 'approved';

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      'Instagram': '#fbeaf0',
      'Facebook': '#eaf3de',
      'YouTube': '#fcebeb',
      'TikTok': '#eeedfe',
      'LinkedIn': '#e6f1fb',
      'X (Twitter)': '#f1efe8',
      'Pinterest': '#faece7',
      'Snapchat': '#faeeda',
    };
    return colors[platform] || '#f5f3f0';
  };

  const getPlatformTextColor = (platform: string) => {
    const colors: Record<string, string> = {
      'Instagram': '#72243e',
      'Facebook': '#27500a',
      'YouTube': '#791f1f',
      'TikTok': '#3c3489',
      'LinkedIn': '#0c447c',
      'X (Twitter)': '#444441',
      'Pinterest': '#712b13',
      'Snapchat': '#854f0b',
    };
    return colors[platform] || '#1A1612';
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
    >
      {showSuccessMessage && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[60] px-8 py-4 shadow-2xl flex items-center gap-3"
          style={{
            backgroundColor: primaryColor,
            color: '#FFFFFF',
            borderRadius: '16px'
          }}
        >
          <Check className="w-6 h-6" />
          <span className="font-semibold text-lg">Post approved! Great work!</span>
        </div>
      )}

      <div
        className="bg-white max-w-6xl w-full my-8 shadow-2xl overflow-y-auto"
        style={{
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          borderRadius: '18px',
          maxHeight: '90vh'
        }}
      >
        {/* Header */}
        <div className="px-6 md:px-12 py-6 md:py-8 border-b border-[#E8E3DC]">
          <div className="flex items-start justify-between mb-3">
            <h2
              style={{
                fontFamily: "'Inter', -apple-system, sans-serif",
                fontSize: '20px',
                fontWeight: 800,
                color: '#1a1a18',
                letterSpacing: '-0.5px'
              }}
              className="md:text-[22px]"
            >
              {post.title}
            </h2>
            <button
              onClick={onClose}
              className="text-[#C5C2BA] hover:text-[#8C8479] transition-colors flex-shrink-0 ml-4"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {platforms.map((platform: string) => (
              <span
                key={platform}
                className="px-3 py-1 text-xs font-semibold rounded-full"
                style={{
                  backgroundColor: getPlatformColor(platform),
                  color: getPlatformTextColor(platform)
                }}
              >
                {platform}
              </span>
            ))}
            {post.scheduled_date && (
              <span className="text-xs text-[#8C8479]">
                Scheduled for {new Date(post.scheduled_date + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            )}
          </div>
        </div>

        {/* Desktop: Two-column grid layout (>= 768px) */}
        <div className="hidden md:grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          {/* Left column - Image and Caption */}
          <div className="p-12 border-r border-[#E8E3DC]">
            {hasMedia ? (
              <div className="mb-8" style={{ borderRadius: '12px', overflow: 'hidden', aspectRatio: '3/4', background: '#f7f3ed' }}>
                <MediaPreview
                  imageUrl={post.image_url}
                  videoUrl={post.video_url}
                  thumbnailUrl={post.thumbnail_url}
                  showControls={true}
                  objectFit="contain"
                  maxHeight="100%"
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center mb-8"
                style={{
                  borderRadius: '12px',
                  height: '350px',
                  background: '#f7f3ed'
                }}
              >
                <div className="text-4xl mb-2">{brandName?.charAt(0) || platforms[0].charAt(0)}</div>
                <p className="text-sm text-[#8C8479]">No media attached</p>
              </div>
            )}

            <div>
              <div className="text-[9px] font-semibold text-[#8C8479] uppercase tracking-wider mb-2">
                Caption
              </div>
              {post.caption && (
                <p className="text-sm text-[#1A1612] whitespace-pre-wrap leading-relaxed">
                  {post.caption}
                </p>
              )}
            </div>
          </div>

          {/* Right column - Reactions, Feedback, and Actions */}
          <div className="p-12 flex flex-col">
            {/* Quick Reactions */}
            <div className="mb-6">
              <div className="text-[9px] font-semibold text-[#8C8479] uppercase tracking-wider mb-3">
                Quick Reactions
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
                    className="px-4 py-2 text-sm font-medium transition-all rounded-full"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: selectedReactions.includes(emoji)
                        ? '2px solid #C9A96E'
                        : '1px solid #E8E3DC',
                      color: '#1A1612'
                    }}
                  >
                    {emoji} {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Your Feedback */}
            <div className="mb-6 flex-1">
              <div className="text-[9px] font-semibold text-[#8C8479] uppercase tracking-wider mb-3">
                Your Feedback
              </div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-4 py-3 border border-[#E8E3DC] text-sm text-[#1A1612] outline-none resize-none"
                style={{
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                  borderRadius: '10px',
                  minHeight: '120px'
                }}
                placeholder="Share your thoughts..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-auto">
              <button
                onClick={handleApprove}
                disabled={isApproved}
                className="flex-1 text-center font-bold text-sm transition-all"
                style={{
                  background: '#eaf3de',
                  color: '#27500a',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '14px',
                  opacity: isApproved ? 0.6 : 1,
                  cursor: isApproved ? 'not-allowed' : 'pointer'
                }}
              >
                {isApproved ? '✅ Approved!' : '👍 Approve'}
              </button>
              <button
                onClick={handleRequestEdits}
                className="flex-1 text-center font-bold text-sm transition-all"
                style={{
                  background: '#fbeaf0',
                  color: '#72243e',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '14px'
                }}
              >
                ✏️ Request Edits
              </button>
            </div>
          </div>
        </div>

        {/* Mobile: Single column stacked layout (< 768px) */}
        <div className="md:hidden flex flex-col">
          {/* Image first */}
          <div className="p-6">
            {hasMedia ? (
              <div style={{ borderRadius: '12px', overflow: 'hidden', aspectRatio: '3/4', background: '#f7f3ed' }}>
                <MediaPreview
                  imageUrl={post.image_url}
                  videoUrl={post.video_url}
                  thumbnailUrl={post.thumbnail_url}
                  showControls={true}
                  objectFit="contain"
                  maxHeight="100%"
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center"
                style={{
                  borderRadius: '12px',
                  height: '250px',
                  background: '#f7f3ed'
                }}
              >
                <div className="text-4xl mb-2">{brandName?.charAt(0) || platforms[0].charAt(0)}</div>
                <p className="text-sm text-[#8C8479]">No media attached</p>
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="px-6 pb-6">
            <div className="text-[9px] font-semibold text-[#8C8479] uppercase tracking-wider mb-2">
              Caption
            </div>
            {post.caption && (
              <p className="text-sm text-[#1A1612] whitespace-pre-wrap leading-relaxed">
                {post.caption}
              </p>
            )}
          </div>

          {/* Quick Reactions */}
          <div className="px-6 pb-6">
            <div className="text-[9px] font-semibold text-[#8C8479] uppercase tracking-wider mb-3">
              Quick Reactions
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
                  className="px-4 py-2 text-sm font-medium transition-all rounded-full"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: selectedReactions.includes(emoji)
                      ? '2px solid #C9A96E'
                      : '1px solid #E8E3DC',
                    color: '#1A1612'
                  }}
                >
                  {emoji} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Textarea */}
          <div className="px-6 pb-6">
            <div className="text-[9px] font-semibold text-[#8C8479] uppercase tracking-wider mb-3">
              Your Feedback
            </div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-4 py-3 border border-[#E8E3DC] text-sm text-[#1A1612] outline-none resize-none"
              style={{
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                borderRadius: '10px',
                minHeight: '100px'
              }}
              placeholder="Share your thoughts..."
            />
          </div>

          {/* Action Buttons - Full width on mobile */}
          <div className="px-6 pb-6 flex flex-col gap-3">
            <button
              onClick={handleApprove}
              disabled={isApproved}
              className="w-full text-center font-bold text-sm transition-all"
              style={{
                background: '#eaf3de',
                color: '#27500a',
                border: 'none',
                borderRadius: '10px',
                padding: '14px',
                opacity: isApproved ? 0.6 : 1,
                cursor: isApproved ? 'not-allowed' : 'pointer'
              }}
            >
              {isApproved ? '✅ Approved!' : '👍 Approve'}
            </button>
            <button
              onClick={handleRequestEdits}
              className="w-full text-center font-bold text-sm transition-all"
              style={{
                background: '#fbeaf0',
                color: '#72243e',
                border: 'none',
                borderRadius: '10px',
                padding: '14px'
              }}
            >
              ✏️ Request Edits
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
