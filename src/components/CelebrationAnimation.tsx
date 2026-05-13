import { useEffect, useState } from 'react';
import { Sparkles, Heart, Star } from 'lucide-react';

interface CelebrationAnimationProps {
  onComplete: () => void;
}

export function CelebrationAnimation({ onComplete }: CelebrationAnimationProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; icon: number }>>([]);

  useEffect(() => {
    const items = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      icon: Math.floor(Math.random() * 3)
    }));
    setConfetti(items);

    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  const getIcon = (type: number) => {
    switch (type) {
      case 0:
        return <Sparkles className="w-6 h-6 text-yellow-400" />;
      case 1:
        return <Heart className="w-6 h-6 text-pink-500" />;
      case 2:
        return <Star className="w-6 h-6 text-blue-500" />;
      default:
        return <Sparkles className="w-6 h-6 text-yellow-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-20 animate-fade-in-out" />

      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center animate-bounce-in">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md">
          <div className="mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto animate-scale-up">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Approved!</h2>
          <p className="text-gray-600 text-lg">This post looks perfect!</p>
        </div>
      </div>

      {confetti.map((item) => (
        <div
          key={item.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${item.left}%`,
            top: '-50px',
            animationDelay: `${item.delay}s`,
          }}
        >
          {getIcon(item.icon)}
        </div>
      ))}

      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-50px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes fade-in-out {
          0%, 100% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes bounce-in {
          0% {
            transform: translate(-50%, -50%) scale(0.3);
            opacity: 0;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.05);
          }
          70% {
            transform: translate(-50%, -50%) scale(0.9);
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
        }

        @keyframes scale-up {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

        .animate-confetti-fall {
          animation: confetti-fall 2.5s ease-in forwards;
        }

        .animate-fade-in-out {
          animation: fade-in-out 3s ease-in-out forwards;
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
        }

        .animate-scale-up {
          animation: scale-up 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.2s forwards;
          transform: scale(0);
        }
      `}</style>
    </div>
  );
}
