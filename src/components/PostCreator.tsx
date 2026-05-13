import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Plus } from 'lucide-react';
import { MediaUpload } from './MediaUpload';
import { MediaLinkInput } from './MediaLinkInput';
import { SocialMediaMockup } from './SocialMediaMockup';

interface PostCreatorProps {
  calendarId: string;
  platforms: string[];
  brandName?: string;
  brandLogoUrl?: string;
  calendarCreatedAt?: string;
  onClose: () => void;
  onSuccess: () => void;
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

export function PostCreator({
  calendarId,
  platforms,
  brandName,
  brandLogoUrl,
  calendarCreatedAt,
  onClose,
  onSuccess
}: PostCreatorProps) {
  const [formData, setFormData] = useState({
    platform: platforms[0] || 'Instagram',
    platforms: [platforms[0] || 'Instagram'],
    title: '',
    caption: '',
    image_url: '',
    video_url: '',
    thumbnail_url: '',
    media_type: '' as 'image' | 'video' | '',
    scheduled_date: '',
  });
  const [saving, setSaving] = useState(false);

  const togglePlatform = (platform: string) => {
    const newPlatforms = formData.platforms.includes(platform)
      ? formData.platforms.filter(p => p !== platform)
      : [...formData.platforms, platform];

    setFormData({
      ...formData,
      platforms: newPlatforms,
      platform: newPlatforms[0] || platforms[0]
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
      // Ensure scheduled_date is always set
      let scheduledDate = formData.scheduled_date;

      if (!scheduledDate && calendarCreatedAt) {
        // Use first day of calendar's month as default
        const calendarDate = new Date(calendarCreatedAt);
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        scheduledDate = new Date(year, month, 1).toISOString().split('T')[0];
      }

      if (!scheduledDate) {
        // Fallback to current month if no calendar date
        const now = new Date();
        scheduledDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      }

      // Calculate day_number from scheduled_date
      const scheduledDateObj = new Date(scheduledDate);
      const dayNumber = scheduledDateObj.getDate();

      const { error } = await supabase
        .from('calendar_posts')
        .insert({
          calendar_id: calendarId,
          platform: formData.platform,
          platforms: formData.platforms,
          title: formData.title,
          caption: formData.caption,
          image_url: formData.image_url || null,
          video_url: formData.video_url || null,
          thumbnail_url: formData.thumbnail_url || null,
          media_type: formData.media_type || null,
          scheduled_date: scheduledDate,
          day_number: dayNumber,
          approval_status: 'pending',
        });

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create New Post</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platforms * (Select one or more)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {ALL_PLATFORMS.map((platform) => (
                    <label
                      key={platform}
                      className={`flex items-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.platforms.includes(platform)
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.platforms.includes(platform)}
                        onChange={() => togglePlatform(platform)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="font-medium">{platform}</span>
                    </label>
                  ))}
                </div>
                {formData.platforms.length === 0 && (
                  <p className="text-xs text-red-600 mt-2">Please select at least one platform</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Post Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Spring Sale Announcement"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Scheduled Date
                </label>
                <input
                  type="date"
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Image
                </label>
                <p className="text-xs text-gray-500 mb-2">Upload images directly (max 5MB)</p>
                <MediaUpload
                  imageValue={formData.image_url}
                  videoValue=""
                  onChange={handleMediaChange}
                  onRemove={handleMediaRemove}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or Add Video Link
                </label>
                <p className="text-xs text-gray-500 mb-2">For videos, paste a link from YouTube, Vimeo, or Google Drive</p>
                <MediaLinkInput
                  imageValue=""
                  videoValue={formData.video_url}
                  thumbnailValue={formData.thumbnail_url}
                  onChange={handleMediaChange}
                  onThumbnailChange={handleThumbnailChange}
                  onRemove={handleMediaRemove}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Caption *
                </label>
                <textarea
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={8}
                  placeholder="Write your caption here... (100% manual, no AI)"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.caption.length} characters
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || formData.platforms.length === 0}
                  className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Post'}
                </button>
              </div>
            </form>
          </div>

          <div>
            <div className="sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
              <SocialMediaMockup
                platform={formData.platform}
                imageUrl={formData.image_url}
                videoUrl={formData.video_url}
                mediaType={formData.media_type}
                caption={formData.caption || 'Your caption will appear here...'}
                brandName={brandName}
                brandLogoUrl={brandLogoUrl}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
