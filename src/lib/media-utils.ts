export type MediaType = 'image' | 'video' | 'youtube' | 'vimeo' | 'tiktok' | 'google-drive-video' | 'google-drive-image' | 'canva';

export interface MediaInfo {
  type: MediaType;
  embedUrl: string;
  originalUrl: string;
  platform?: string;
}

export function detectMediaType(url: string): MediaType {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes('.mp4') || lowerUrl.includes('.mov') || lowerUrl.includes('.webm') || lowerUrl.includes('.avi')) {
    return 'video';
  }

  if (lowerUrl.includes('youtube.com') || lowerUrl.includes('youtu.be')) {
    return 'youtube';
  }

  if (lowerUrl.includes('vimeo.com')) {
    return 'vimeo';
  }

  if (lowerUrl.includes('tiktok.com')) {
    return 'tiktok';
  }

  if (lowerUrl.includes('drive.google.com')) {
    const fileId = getGoogleDriveFileId(url);
    if (fileId) {
      // For Google Drive, we can't reliably detect the file type from the URL alone
      // Since video links are explicitly added in the "video link" field, default to video
      // This matches the user's intent when they paste a Google Drive link in the video field
      return 'google-drive-video';
    }
  }

  if (lowerUrl.includes('canva.com')) {
    return 'canva';
  }

  return 'image';
}

export function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtu\.be\/)([^?]+)/,
    /(?:youtube\.com\/embed\/)([^?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function getVimeoVideoId(url: string): string | null {
  const patterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function getGoogleDriveFileId(url: string): string | null {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,  // /file/d/ID/view or /file/d/ID/view?usp=sharing
    /\/d\/([a-zA-Z0-9_-]+)/,         // /d/ID
    /[?&]id=([a-zA-Z0-9_-]+)/,       // ?id=ID or &id=ID
    /\/open\?id=([a-zA-Z0-9_-]+)/,   // /open?id=ID
    /uc\?.*id=([a-zA-Z0-9_-]+)/,     // uc?id=ID or uc?export=view&id=ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

export function convertToEmbedUrl(url: string, type: MediaType): string {
  switch (type) {
    case 'youtube': {
      const videoId = getYouTubeVideoId(url);
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }

    case 'vimeo': {
      const videoId = getVimeoVideoId(url);
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }

    case 'google-drive-video': {
      const fileId = getGoogleDriveFileId(url);
      return fileId ? `https://drive.google.com/file/d/${fileId}/preview` : url;
    }

    case 'google-drive-image': {
      const fileId = getGoogleDriveFileId(url);
      return fileId ? `https://drive.google.com/uc?export=view&id=${fileId}` : url;
    }

    case 'canva':
      return url;

    case 'video':
    case 'image':
    case 'tiktok':
    default:
      return url;
  }
}

export function getMediaInfo(url: string): MediaInfo {
  if (!url) {
    return {
      type: 'image',
      embedUrl: '',
      originalUrl: '',
    };
  }

  const type = detectMediaType(url);
  const embedUrl = convertToEmbedUrl(url, type);

  let platform: string | undefined;
  if (type === 'youtube') platform = 'YouTube';
  else if (type === 'vimeo') platform = 'Vimeo';
  else if (type === 'tiktok') platform = 'TikTok';
  else if (type.includes('google-drive')) platform = 'Google Drive';
  else if (type === 'canva') platform = 'Canva';

  return {
    type,
    embedUrl,
    originalUrl: url,
    platform,
  };
}

export function getThumbnailUrl(videoUrl: string, thumbnailUrl?: string): string | null {
  if (thumbnailUrl) return thumbnailUrl;

  const type = detectMediaType(videoUrl);

  if (type === 'youtube') {
    const videoId = getYouTubeVideoId(videoUrl);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  }

  return null;
}
