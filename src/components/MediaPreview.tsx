import { useState } from 'react';
import { Image as ImageIcon, Video as VideoIcon, PlayCircle, AlertCircle } from 'lucide-react';
import { getMediaInfo, MediaInfo } from '../lib/media-utils';

interface MediaPreviewProps {
  imageUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  className?: string;
  showControls?: boolean;
  showBadge?: boolean;
  objectFit?: 'cover' | 'contain';
  maxHeight?: string;
  onClick?: () => void;
}

export function MediaPreview({
  imageUrl,
  videoUrl,
  thumbnailUrl,
  className = '',
  showControls = false,
  showBadge = false,
  objectFit = 'cover',
  maxHeight = '200px',
  onClick,
}: MediaPreviewProps) {
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Determine if we're showing a video or image based on what's provided
  // Priority: if imageUrl exists, show image. If only videoUrl exists, show video.
  const hasImage = imageUrl && imageUrl.trim() !== '';
  const hasVideo = videoUrl && videoUrl.trim() !== '';

  const isVideo = !hasImage && hasVideo;
  const mediaUrl = hasImage ? imageUrl : (hasVideo ? videoUrl : '');

  if (!mediaUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-[#E8D5C4] to-[#EEF4F0] ${className}`}
        style={{ maxHeight }}
      >
        <ImageIcon className="w-8 h-8 text-[#8C8479]" />
      </div>
    );
  }

  const mediaInfo: MediaInfo = getMediaInfo(mediaUrl);

  const handleError = () => {
    console.error('Failed to load media:', mediaUrl);
    setLoadError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  if (loadError) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#E8D5C4] to-[#EEF4F0] ${className}`}
        style={{ maxHeight }}
      >
        <AlertCircle className="w-8 h-8 text-[#8C8479]" />
        <p className="text-xs text-[#8C8479] text-center px-4">
          {isVideo ? 'Video unavailable' : 'Image unavailable'}
        </p>
        {mediaInfo.platform && (
          <p className="text-xs text-[#8C8479]">{mediaInfo.platform}</p>
        )}
      </div>
    );
  }

  const renderMedia = () => {
    if (isVideo) {
      switch (mediaInfo.type) {
        case 'google-drive-video':
          return (
            <a
              href={mediaInfo.originalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex flex-col items-center justify-center gap-3 bg-[#E8F0FD] border border-[#B5D4F4] rounded-[10px] p-8 hover:bg-[#D6E7FA] transition-colors cursor-pointer ${className}`}
              style={{ maxHeight, minHeight: '200px' }}
              onClick={(e) => {
                e.stopPropagation();
                handleLoad();
              }}
            >
              <div className="w-12 h-12 bg-[#4285F4] rounded-lg flex items-center justify-center">
                <VideoIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-900 mb-1">Google Drive Video</p>
                <p className="text-sm text-gray-600">Click to open in Google Drive</p>
              </div>
            </a>
          );

        case 'youtube':
        case 'vimeo':
          return (
            <div className={`relative w-full ${className}`} style={{ maxHeight }}>
              <iframe
                src={mediaInfo.embedUrl}
                className="w-full h-full rounded-lg"
                style={{ maxHeight, minHeight: '200px' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={handleLoad}
                onError={handleError}
              />
              {showBadge && (
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-gray-700 flex items-center gap-1">
                  <VideoIcon className="w-3 h-3" />
                  Video
                </div>
              )}
            </div>
          );

        case 'tiktok':
          return (
            <div
              className={`relative flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-black to-gray-900 ${className}`}
              style={{ maxHeight }}
            >
              <PlayCircle className="w-12 h-12 text-white" />
              <p className="text-sm text-white font-medium">TikTok Video</p>
              <a
                href={mediaInfo.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 underline"
                onClick={(e) => e.stopPropagation()}
              >
                Open in TikTok
              </a>
              {showBadge && (
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-gray-700 flex items-center gap-1">
                  <VideoIcon className="w-3 h-3" />
                  Video
                </div>
              )}
            </div>
          );

        case 'video':
        default:
          return (
            <div className={`relative ${className}`} style={{ maxHeight }}>
              <video
                src={mediaInfo.embedUrl}
                className={`w-full h-full rounded-lg object-${objectFit}`}
                style={{ maxHeight }}
                controls={showControls}
                playsInline
                muted
                onLoadedData={handleLoad}
                onError={handleError}
                onClick={onClick}
              />
              {showBadge && (
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-gray-700 flex items-center gap-1">
                  <VideoIcon className="w-3 h-3" />
                  Video
                </div>
              )}
            </div>
          );
      }
    } else {
      if (mediaInfo.type === 'google-drive-image') {
        return (
          <a
            href={mediaInfo.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col items-center justify-center gap-3 bg-[#E8F0FD] border border-[#B5D4F4] rounded-[10px] p-8 hover:bg-[#D6E7FA] transition-colors cursor-pointer ${className}`}
            style={{ maxHeight, minHeight: '200px' }}
            onClick={(e) => {
              e.stopPropagation();
              handleLoad();
            }}
          >
            <div className="w-12 h-12 bg-[#4285F4] rounded-lg flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-gray-900 mb-1">Google Drive Image</p>
              <p className="text-sm text-gray-600">Click to open in Google Drive</p>
            </div>
          </a>
        );
      }

      if (mediaInfo.type === 'canva') {
        return (
          <div className={`relative ${className}`} style={{ maxHeight, minHeight: '200px' }}>
            <iframe
              src={mediaInfo.embedUrl}
              className="w-full h-full rounded-lg"
              style={{ maxHeight, minHeight: '200px' }}
              onLoad={handleLoad}
              onError={handleError}
            />
            {showBadge && (
              <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-gray-700 flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                Image
              </div>
            )}
          </div>
        );
      }

      return (
        <div className={`relative ${className}`} style={{ maxHeight }}>
          <img
            src={mediaInfo.embedUrl}
            alt="Media preview"
            className={`w-full h-full rounded-lg object-${objectFit}`}
            style={{ maxHeight }}
            onLoad={handleLoad}
            onError={handleError}
            onClick={onClick}
          />
          {showBadge && (
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-gray-700 flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              Image
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <>
      {isLoading && (
        <div
          className={`flex items-center justify-center bg-gray-100 ${className}`}
          style={{ maxHeight }}
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A96E]" />
        </div>
      )}
      <div className={isLoading ? 'hidden' : ''}>{renderMedia()}</div>
    </>
  );
}
