import { Smartphone, Monitor } from 'lucide-react';

interface DeviceMockupProps {
  imageUrl: string;
  platform: string;
  caption: string;
  title: string;
  darkMode?: boolean;
}

export function DeviceMockup({ imageUrl, platform, caption, title, darkMode = false }: DeviceMockupProps) {
  const isMobilePlatform = ['Instagram', 'TikTok', 'Facebook', 'LinkedIn'].includes(platform);

  if (isMobilePlatform) {
    return (
      <div className="mx-auto max-w-sm">
        <div
          className={`relative ${darkMode ? 'bg-gray-800' : 'bg-gray-900'} rounded-[2.5rem] p-3 shadow-2xl border-8 ${darkMode ? 'border-gray-700' : 'border-gray-800'} transition-all duration-300`}
          style={{
            boxShadow: darkMode
              ? '0 32px 64px -12px rgba(0, 0, 0, 0.8), 0 0 48px -12px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.05)'
              : '0 32px 64px -12px rgba(0, 0, 0, 0.5), 0 0 48px -12px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 ${darkMode ? 'bg-gray-800' : 'bg-gray-900'} rounded-b-3xl z-10`} />

          <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-[1.75rem] overflow-hidden relative backdrop-blur-xl border ${darkMode ? 'border-gray-700/50' : 'border-gray-100'}`}
            style={{
              boxShadow: darkMode
                ? 'inset 0 2px 4px rgba(0, 0, 0, 0.3)'
                : 'inset 0 2px 4px rgba(0, 0, 0, 0.05)'
            }}
          >
            <div className={`${darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-900' : 'bg-gradient-to-r from-gray-100 to-gray-50'} px-4 py-3 flex items-center justify-between border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} backdrop-blur-md`}>
              <div className="flex items-center gap-2">
                <Smartphone className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{platform}</span>
              </div>
              <div className="flex gap-1">
                <div className={`w-1 h-1 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-400'}`} />
                <div className={`w-1 h-1 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-400'}`} />
                <div className={`w-1 h-1 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-gray-400'}`} />
              </div>
            </div>

            <div className={darkMode ? 'bg-black' : 'bg-white'}>
              <div className="relative w-full" style={{ paddingBottom: '100%' }}>
                <img
                  src={imageUrl}
                  alt={title}
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{
                    background: darkMode
                      ? 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)'
                      : 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'
                  }}
                />
              </div>

              {caption && (
                <div className={`p-4 ${darkMode ? 'bg-gray-900' : 'bg-white'} border-t ${darkMode ? 'border-gray-800' : 'border-gray-100'} backdrop-blur-md`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-800'} leading-relaxed whitespace-pre-wrap line-clamp-6`}>
                    {caption}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div
        className={`relative ${darkMode ? 'bg-gray-800' : 'bg-gray-900'} rounded-t-2xl p-2 shadow-2xl transition-all duration-300`}
        style={{
          boxShadow: darkMode
            ? '0 32px 64px -12px rgba(0, 0, 0, 0.8), 0 0 48px -12px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.05)'
            : '0 32px 64px -12px rgba(0, 0, 0, 0.5), 0 0 48px -12px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg" style={{ boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)' }} />
            <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-lg" style={{ boxShadow: '0 0 8px rgba(234, 179, 8, 0.5)' }} />
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg" style={{ boxShadow: '0 0 8px rgba(34, 197, 94, 0.5)' }} />
          </div>
          <div className={`flex-1 ${darkMode ? 'bg-gray-900' : 'bg-gray-800'} rounded px-3 py-1 flex items-center gap-2 backdrop-blur-md border ${darkMode ? 'border-gray-700' : 'border-gray-700/50'}`}>
            <Monitor className={`w-3 h-3 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`} />
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}>{platform}</span>
          </div>
        </div>

        <div
          className={`${darkMode ? 'bg-gray-900' : 'bg-white'} rounded overflow-hidden border ${darkMode ? 'border-gray-700/50' : 'border-gray-100'} backdrop-blur-xl`}
          style={{
            boxShadow: darkMode
              ? 'inset 0 2px 8px rgba(0, 0, 0, 0.3)'
              : 'inset 0 2px 8px rgba(0, 0, 0, 0.05)'
          }}
        >
          <div className="relative w-full">
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-auto object-contain"
              style={{
                maxHeight: '600px',
                background: darkMode
                  ? 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)'
                  : 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'
              }}
            />
          </div>

          {caption && (
            <div className={`p-6 ${darkMode ? 'bg-gray-900' : 'bg-white'} border-t ${darkMode ? 'border-gray-800' : 'border-gray-100'} backdrop-blur-md`}>
              <p className={`text-base ${darkMode ? 'text-gray-300' : 'text-gray-800'} leading-relaxed whitespace-pre-wrap`}>
                {caption}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
