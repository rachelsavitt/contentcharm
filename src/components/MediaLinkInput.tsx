import { useState, useEffect } from 'react';
import { Link, X, CheckCircle, AlertCircle } from 'lucide-react';
import { MediaPreview } from './MediaPreview';
import { getMediaInfo } from '../lib/media-utils';

interface MediaLinkInputProps {
  imageValue?: string;
  videoValue?: string;
  thumbnailValue?: string;
  onChange: (url: string, type: 'image' | 'video') => void;
  onThumbnailChange?: (url: string) => void;
  onRemove?: () => void;
}

export function MediaLinkInput({
  imageValue,
  videoValue,
  thumbnailValue,
  onChange,
  onThumbnailChange,
  onRemove
}: MediaLinkInputProps) {
  const [linkInput, setLinkInput] = useState('');
  const [thumbnailInput, setThumbnailInput] = useState('');
  const [validating, setValidating] = useState(false);
  const [validatingThumbnail, setValidatingThumbnail] = useState(false);
  const [error, setError] = useState('');
  const [thumbnailError, setThumbnailError] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [thumbnailValid, setThumbnailValid] = useState(false);

  const currentValue = imageValue || videoValue;
  const currentType = imageValue ? 'image' : videoValue ? 'video' : null;

  useEffect(() => {
    if (currentValue) {
      setLinkInput(currentValue);
      setIsValid(true);
    }
  }, [currentValue]);

  useEffect(() => {
    if (thumbnailValue) {
      setThumbnailInput(thumbnailValue);
      setThumbnailValid(true);
    }
  }, [thumbnailValue]);

  const isImageUrl = (url: string): boolean => {
    const mediaInfo = getMediaInfo(url);
    return mediaInfo.type === 'image' || mediaInfo.type === 'google-drive-image' || mediaInfo.type === 'canva';
  };

  const isVideoUrl = (url: string): boolean => {
    const mediaInfo = getMediaInfo(url);
    return mediaInfo.type === 'video' || mediaInfo.type === 'youtube' ||
           mediaInfo.type === 'vimeo' || mediaInfo.type === 'google-drive-video' ||
           mediaInfo.type === 'tiktok';
  };

  const validateMediaLink = async (url: string): Promise<{ valid: boolean; type: 'image' | 'video' | null; error?: string }> => {
    if (!url) {
      return { valid: false, type: null, error: 'Please enter a URL' };
    }

    try {
      new URL(url);
    } catch {
      return { valid: false, type: null, error: 'Invalid URL format' };
    }

    const mediaInfo = getMediaInfo(url);

    if (isVideoUrl(url)) {
      return { valid: true, type: 'video' };
    }

    return { valid: false, type: null, error: 'Please enter a valid video URL (YouTube, Vimeo, Google Drive, etc.)' };
  };

  const handleLinkSubmit = async () => {
    if (!linkInput.trim()) {
      setError('Please enter a URL');
      return;
    }

    setValidating(true);
    setError('');
    setIsValid(false);

    const result = await validateMediaLink(linkInput.trim());

    setValidating(false);

    if (result.valid && result.type) {
      const mediaInfo = getMediaInfo(linkInput.trim());
      onChange(mediaInfo.embedUrl, result.type);
      setIsValid(true);
      setError('');
    } else {
      setError(result.error || 'Invalid media URL');
      setIsValid(false);
    }
  };

  const handleThumbnailSubmit = async () => {
    if (!thumbnailInput.trim()) {
      setThumbnailError('Please enter a thumbnail URL');
      return;
    }

    setValidatingThumbnail(true);
    setThumbnailError('');
    setThumbnailValid(false);

    const result = await validateMediaLink(thumbnailInput.trim());

    setValidatingThumbnail(false);

    if (result.valid && result.type === 'image') {
      const mediaInfo = getMediaInfo(thumbnailInput.trim());
      if (onThumbnailChange) {
        onThumbnailChange(mediaInfo.embedUrl);
      }
      setThumbnailValid(true);
      setThumbnailError('');
    } else {
      setThumbnailError('Invalid image URL for thumbnail');
      setThumbnailValid(false);
    }
  };

  const handleRemove = () => {
    setLinkInput('');
    setIsValid(false);
    setError('');
    if (onRemove) {
      onRemove();
    }
  };

  const handleThumbnailRemove = () => {
    setThumbnailInput('');
    setThumbnailValid(false);
    setThumbnailError('');
    if (onThumbnailChange) {
      onThumbnailChange('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={linkInput}
              onChange={(e) => {
                setLinkInput(e.target.value);
                setIsValid(false);
                setError('');
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleLinkSubmit();
                }
              }}
              placeholder="Paste video link here (YouTube, Vimeo, Google Drive, etc.)"
              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={validating}
            />
            {isValid && currentValue && (
              <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-green-500" />
            )}
            {error && (
              <AlertCircle className="absolute right-3 top-3 w-5 h-5 text-red-500" />
            )}
          </div>
          {!currentValue && (
            <button
              type="button"
              onClick={handleLinkSubmit}
              disabled={validating || !linkInput.trim()}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {validating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Validating...
                </>
              ) : (
                <>
                  <Link className="w-4 h-4" />
                  Add Link
                </>
              )}
            </button>
          )}
          {currentValue && (
            <button
              type="button"
              onClick={handleRemove}
              className="px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Remove
            </button>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}

        {isValid && currentValue && (
          <p className="text-sm text-green-600 flex items-center gap-1">
            <CheckCircle className="w-4 h-4" />
            Video link validated successfully
          </p>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
          <p className="text-xs font-medium text-blue-900">Supported video platforms:</p>

          <ul className="text-xs text-blue-800 space-y-0.5 ml-4">
            <li>YouTube (youtube.com or youtu.be)</li>
            <li>Vimeo</li>
            <li>Google Drive video links</li>
            <li>Direct video URLs (.mp4, .mov, .webm)</li>
            <li>TikTok (link preview only — cannot be embedded)</li>
          </ul>

          <p className="text-xs text-blue-700 pt-1 italic">
            For Google Drive, set sharing to 'Anyone with the link can view'. For YouTube/Vimeo, paste the regular watch URL.
          </p>
        </div>
      </div>

      {currentValue && (
        <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
          <MediaPreview
            imageUrl={currentType === 'image' ? currentValue : undefined}
            videoUrl={currentType === 'video' ? currentValue : undefined}
            showBadge={true}
            showControls={true}
            maxHeight="256px"
            className="w-full"
          />
        </div>
      )}

      {currentType === 'video' && videoValue && onThumbnailChange && (
        <div className="mt-4 space-y-2 pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700">
            Video Thumbnail URL (Optional)
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Provide a link to a cover image that will be displayed in the calendar view
          </p>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={thumbnailInput}
                onChange={(e) => {
                  setThumbnailInput(e.target.value);
                  setThumbnailValid(false);
                  setThumbnailError('');
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleThumbnailSubmit();
                  }
                }}
                placeholder="Paste thumbnail image link here"
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={validatingThumbnail}
              />
              {thumbnailValid && thumbnailValue && (
                <CheckCircle className="absolute right-3 top-2.5 w-4 h-4 text-green-500" />
              )}
            </div>
            {!thumbnailValue && (
              <button
                type="button"
                onClick={handleThumbnailSubmit}
                disabled={validatingThumbnail || !thumbnailInput.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {validatingThumbnail ? 'Validating...' : 'Add'}
              </button>
            )}
            {thumbnailValue && (
              <button
                type="button"
                onClick={handleThumbnailRemove}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
              >
                Remove
              </button>
            )}
          </div>

          {thumbnailError && (
            <p className="text-sm text-red-600">{thumbnailError}</p>
          )}

          {thumbnailValid && thumbnailValue && (
            <div className="relative rounded-lg overflow-hidden border border-gray-200 mt-2">
              <img
                src={thumbnailValue}
                alt="Thumbnail preview"
                className="w-full h-32 object-cover"
                onError={() => setThumbnailError('Failed to load thumbnail image')}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
