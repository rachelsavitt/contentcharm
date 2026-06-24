import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Content Charm 🤎',
    description: 'Turn any client\'s website into a month of on-brand content they approve in one tap. No more chasing approvals over email.',
  },
  {
    id: 'how',
    title: 'One link does it all',
    description: 'Paste a client\'s website and we build their brand profile automatically — voice, colors, themes. Then we generate a month of captions that sound exactly like them.',
  },
  {
    id: 'approve',
    title: 'They approve in one tap',
    description: 'Send your client one clean link. They review everything on a beautiful branded page and approve with a single tap — no logins, no back-and-forth.',
  },
  {
    id: 'complete',
    title: 'Let\'s set up your first client',
    description: 'All you need is their website. We\'ll handle the brand profile and the first month of content — it takes about a minute.',
  },
];

interface OnboardingProps {
  onComplete: () => void;
  onOpenCalendarCreator?: () => void;
}

export function Onboarding({ onComplete, onOpenCalendarCreator }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const step = ONBOARDING_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  // Remove target highlighting to prevent positioning issues
  useEffect(() => {
    setTargetRect(null);
  }, [currentStep]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
      if (onOpenCalendarCreator) {
        onOpenCalendarCreator();
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  // Always center the tooltip to prevent overflow
  const getTooltipPosition = () => {
    return {
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
    };
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-[60]"
        onClick={handleSkip}
      />

      <div
        className="fixed z-[70] bg-white rounded-lg shadow-2xl w-[calc(100%-40px)] max-w-[480px] overflow-hidden transition-all duration-300"
        style={getTooltipPosition()}
      >
        <div className="p-7">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-2xl text-[#1A1612] mb-2 break-words" style={{ fontFamily: 'DM Serif Display, serif' }}>
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed break-words">
                {step.description}
              </p>
            </div>
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-4 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-1.5 flex-shrink-0">
              {ONBOARDING_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'w-8'
                      : 'w-2'
                  }`}
                  style={{ backgroundColor: index === currentStep ? '#C9A96E' : index < currentStep ? '#C9A96E80' : '#E8E3DC' }}
                />
              ))}
            </div>

            <div className="flex gap-2 flex-shrink-0 ml-4">
              {!isFirstStep && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors whitespace-nowrap"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors whitespace-nowrap"
                style={{ backgroundColor: '#C9A96E' }}
              >
                {isLastStep ? (
                  <>
                    Add your first client
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
