import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { MediaPreview } from './MediaPreview';

interface SocialMediaMockupProps {
  platform: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: 'image' | 'video' | '';
  caption: string;
  brandName?: string;
  brandLogoUrl?: string;
  mockupLogoUrl?: string;
  darkMode?: boolean;
  brandColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export function SocialMediaMockup({
  platform,
  imageUrl,
  videoUrl,
  mediaType,
  caption,
  brandName = 'Your Brand',
  brandLogoUrl,
  mockupLogoUrl,
  brandColors = {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#06B6D4'
  }
}: SocialMediaMockupProps) {
  const hasMedia = imageUrl || videoUrl;
  const isVideo = mediaType === 'video' || (!mediaType && videoUrl);
  const mediaUrl = isVideo ? videoUrl : imageUrl;
  const displayLogoUrl = mockupLogoUrl || brandLogoUrl;

  const renderInstagramMockup = () => (
    <div className="rounded-3xl shadow-2xl overflow-hidden max-w-md mx-auto border bg-white border-gray-200/50 transition-all duration-300 hover:shadow-3xl"
    style={{
      boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(${brandColors.primary}, 0.05)`
    }}
    >
      <div className="h-8 bg-gradient-to-b from-black/20 to-transparent relative top-0 left-0 right-0 z-10 flex items-center justify-center pt-2">
        <div className="w-28 h-6 bg-black/40 rounded-b-3xl" />
      </div>

      <div className="bg-white border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full p-0.5 flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.accent})`
              }}
            >
              {displayLogoUrl ? (
                <img
                  src={displayLogoUrl}
                  alt={brandName}
                  className="w-full h-full rounded-full object-cover bg-white"
                />
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center text-xs font-bold bg-white text-gray-700">
                  {brandName.charAt(0)}
                </div>
              )}
            </div>
            <span className="font-semibold text-sm text-gray-900">{brandName}</span>
          </div>
          <MoreHorizontal className="w-5 h-5 text-gray-700" />
        </div>
      </div>

      {hasMedia ? (
        <div className={`relative w-full bg-gray-50 ${isVideo ? 'aspect-[9/16]' : ''}`} style={{ minHeight: isVideo ? 'auto' : '300px', maxHeight: isVideo ? '600px' : 'none' }}>
          <MediaPreview
            imageUrl={imageUrl}
            videoUrl={videoUrl}
            showControls={true}
            objectFit="contain"
            maxHeight="600px"
            className="w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        </div>
      ) : (
        <div className="w-full aspect-square flex items-center justify-center bg-gray-100">
          <p className="text-sm text-gray-400">No media uploaded</p>
        </div>
      )}

      <div className="p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <Heart className="w-6 h-6 text-gray-900" />
            <MessageCircle className="w-6 h-6 text-gray-900" />
            <Send className="w-6 h-6 text-gray-900" />
          </div>
          <Bookmark className="w-6 h-6 text-gray-900" />
        </div>

        <div className="text-sm leading-relaxed">
          <span className="font-semibold mr-2 text-gray-900">{brandName}</span>
          <span className="whitespace-pre-wrap text-gray-900">{caption}</span>
        </div>
      </div>
    </div>
  );

  const renderFacebookMockup = () => (
    <div
      className="rounded-3xl shadow-2xl overflow-hidden max-w-2xl mx-auto border bg-white border-gray-200/50 transition-all duration-300 hover:shadow-3xl"
      style={{
        boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(${brandColors.primary}, 0.05)`
      }}
    >
      <div className="p-5 border-b bg-white border-gray-100">
        <div className="flex items-center gap-3">
          {displayLogoUrl ? (
            <img
              src={displayLogoUrl}
              alt={brandName}
              className="w-11 h-11 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}
            >
              {brandName.charAt(0)}
            </div>
          )}
          <div>
            <p className="font-semibold text-sm text-gray-900">{brandName}</p>
            <p className="text-xs text-gray-500">Just now · 🌎</p>
          </div>
        </div>
      </div>

      <div className="p-5 bg-white">
        <p className="whitespace-pre-wrap text-sm leading-relaxed mb-3 text-gray-900">{caption}</p>
      </div>

      {hasMedia && (
        <div className="relative">
          <MediaPreview
            imageUrl={imageUrl}
            videoUrl={videoUrl}
            showControls={true}
            objectFit="contain"
            maxHeight="500px"
            className="w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        </div>
      )}

      <div className="p-4 border-t bg-white border-gray-100">
        <div className="flex items-center justify-around text-sm text-gray-600">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:bg-gray-100">
            👍 Like
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:bg-gray-100">
            💬 Comment
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:bg-gray-100">
            ↗️ Share
          </button>
        </div>
      </div>
    </div>
  );

  const renderLinkedInMockup = () => (
    <div
      className="rounded-3xl shadow-2xl overflow-hidden max-w-2xl mx-auto border bg-white border-gray-200/50 transition-all duration-300 hover:shadow-3xl"
      style={{
        boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(${brandColors.primary}, 0.05)`
      }}
    >
      <div className="p-5 bg-white">
        <div className="flex items-start gap-3">
          {displayLogoUrl ? (
            <img
              src={displayLogoUrl}
              alt={brandName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}
            >
              {brandName.charAt(0)}
            </div>
          )}
          <div className="flex-1">
            <p className="font-semibold text-sm text-gray-900">{brandName}</p>
            <p className="text-xs text-gray-500">Just now</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-900">{caption}</p>
        </div>
      </div>

      {hasMedia && (
        <div className="relative">
          <MediaPreview
            imageUrl={imageUrl}
            videoUrl={videoUrl}
            showControls={true}
            objectFit="contain"
            maxHeight="500px"
            className="w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        </div>
      )}

      <div className="p-4 border-t bg-white border-gray-100">
        <div className="flex items-center justify-around text-sm text-gray-600">
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100">
            👍 Like
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100">
            💬 Comment
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100">
            🔄 Repost
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100">
            📤 Send
          </button>
        </div>
      </div>
    </div>
  );

  const renderTwitterMockup = () => (
    <div
      className="rounded-3xl shadow-2xl overflow-hidden max-w-xl mx-auto border bg-white border-gray-200/50 transition-all duration-300 hover:shadow-3xl"
      style={{
        boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 30px rgba(${brandColors.primary}, 0.05)`
      }}
    >
      <div className="p-5 bg-white">
        <div className="flex gap-3">
          {displayLogoUrl ? (
            <img
              src={displayLogoUrl}
              alt={brandName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
              style={{ background: `linear-gradient(135deg, ${brandColors.primary}, ${brandColors.secondary})` }}
            >
              {brandName.charAt(0)}
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="font-bold text-sm text-gray-900">{brandName}</span>
              <span className="text-sm text-gray-500">@{brandName.toLowerCase().replace(/\s/g, '')}</span>
              <span className="text-gray-400">·</span>
              <span className="text-sm text-gray-500">now</span>
            </div>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-gray-900">{caption}</p>

            {hasMedia && (
              <div className="relative mt-4">
                {isVideo ? (
                  <video
                    src={mediaUrl}
                    className="w-full rounded-2xl object-contain bg-gray-50 border border-gray-200"
                    style={{ maxHeight: '500px' }}
                    controls
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt="Post content"
                    className="w-full rounded-2xl object-contain bg-gray-50 border border-gray-200"
                    style={{ maxHeight: '500px' }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl pointer-events-none" />
              </div>
            )}

            <div className="flex items-center justify-between mt-4 max-w-md text-gray-500">
              <button className="flex items-center gap-2 transition-colors hover:text-blue-500">
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs">0</span>
              </button>
              <button className="flex items-center gap-2 transition-colors hover:text-green-500">
                <span className="text-lg">🔄</span>
                <span className="text-xs">0</span>
              </button>
              <button className="flex items-center gap-2 transition-colors hover:text-red-500">
                <Heart className="w-4 h-4" />
                <span className="text-xs">0</span>
              </button>
              <button className="flex items-center gap-2 transition-colors hover:text-blue-500">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const platformKey = platform.toLowerCase();

  if (platformKey.includes('instagram')) {
    return renderInstagramMockup();
  } else if (platformKey.includes('facebook')) {
    return renderFacebookMockup();
  } else if (platformKey.includes('linkedin')) {
    return renderLinkedInMockup();
  } else if (platformKey.includes('twitter') || platformKey.includes('x')) {
    return renderTwitterMockup();
  }

  return renderInstagramMockup();
}
