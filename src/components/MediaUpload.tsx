import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Video } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface MediaUploadProps {
  imageValue?: string;
  videoValue?: string;
  thumbnailValue?: string;
  onChange: (url: string, type: 'image' | 'video') => void;
  onThumbnailChange?: (url: string) => void;
  onRemove?: () => void;
}

export function MediaUpload({ imageValue, videoValue, thumbnailValue, onChange, onThumbnailChange, onRemove }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const currentValue = imageValue || videoValue;
  const currentType = imageValue ? 'image' : videoValue ? 'video' : null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');

    if (!isImage) {
      setError('Please upload an image file (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError('');
    setUploading(true);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to upload images');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      onChange(publicUrl, 'image');
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl('');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image. Please try again.');
      URL.revokeObjectURL(objectUrl);
      setPreviewUrl('');
    } finally {
      setUploading(false);
    }
  };

  const handleThumbnailSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Thumbnail must be an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Thumbnail must be less than 5MB');
      return;
    }

    setError('');
    setUploadingThumbnail(true);

    const objectUrl = URL.createObjectURL(file);
    setThumbnailPreview(objectUrl);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to upload thumbnails');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `thumb-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      if (onThumbnailChange) {
        onThumbnailChange(publicUrl);
      }
      URL.revokeObjectURL(objectUrl);
      setThumbnailPreview('');
    } catch (err) {
      console.error('Thumbnail upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload thumbnail. Please try again.');
      URL.revokeObjectURL(objectUrl);
      setThumbnailPreview('');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
      setThumbnailPreview('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="media-upload"
      />

      {!currentValue && !previewUrl ? (
        <label
          htmlFor="media-upload"
          className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            uploading
              ? 'border-blue-400 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <div className="flex flex-col items-center justify-center py-6">
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-3"></div>
                <p className="text-sm text-gray-600">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-gray-400 mb-3" />
                <p className="mb-2 text-sm text-gray-700 font-medium">
                  Click to upload image
                </p>
                <p className="text-xs text-gray-500">
                  PNG, JPG, WebP (max 5MB)
                </p>
              </>
            )}
          </div>
        </label>
      ) : (
        <div className="relative">
          {(currentType === 'image' || (previewUrl && !uploading)) && currentType !== 'video' ? (
            <img
              src={previewUrl || currentValue}
              alt="Post preview"
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : (
            <video
              src={previewUrl || currentValue}
              className="w-full h-48 object-cover rounded-lg"
              controls={!uploading}
              muted
              loop
            />
          )}
          {!uploading && (
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-3 mx-auto"></div>
                <p className="text-sm text-white">Uploading...</p>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {currentType === 'video' && videoValue && onThumbnailChange && (
        <div className="mt-4 space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Video Thumbnail/Cover Image
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Upload a cover image that will be displayed in the calendar view
          </p>

          <input
            ref={thumbnailInputRef}
            type="file"
            accept="image/*"
            onChange={handleThumbnailSelect}
            className="hidden"
            id="thumbnail-upload"
          />

          {!thumbnailValue && !thumbnailPreview ? (
            <label
              htmlFor="thumbnail-upload"
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                uploadingThumbnail
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col items-center justify-center py-4">
                {uploadingThumbnail ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                    <p className="text-sm text-gray-600">Uploading thumbnail...</p>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-700 font-medium">
                      Click to upload thumbnail
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, WebP (max 5MB)</p>
                  </>
                )}
              </div>
            </label>
          ) : (
            <div className="relative">
              <img
                src={thumbnailPreview || thumbnailValue}
                alt="Video thumbnail"
                className="w-full h-32 object-cover rounded-lg"
              />
              {!uploadingThumbnail && (
                <button
                  onClick={() => {
                    if (onThumbnailChange) {
                      onThumbnailChange('');
                    }
                    if (thumbnailPreview) {
                      URL.revokeObjectURL(thumbnailPreview);
                      setThumbnailPreview('');
                    }
                    if (thumbnailInputRef.current) {
                      thumbnailInputRef.current.value = '';
                    }
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {uploadingThumbnail && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2 mx-auto"></div>
                    <p className="text-sm text-white">Uploading...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!currentValue && !uploading && !previewUrl && (
        <p className="text-xs text-gray-500">
          Tip: For videos, use the video link field to add YouTube, Vimeo, or Google Drive links
        </p>
      )}
    </div>
  );
}
