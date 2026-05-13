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
    title: 'Welcome to Content Charm! 🎉',
    description: 'Stop chasing client approvals over email. Content Charm gives your clients a beautiful, branded page to review, approve, and request edits on your content — in one place.',
  },
  {
    id: 'calendars',
    title: 'Your Calendars',
    description: 'This is your home base. Every client gets their own content calendar. Create as many as you need and keep everything organized in one place.',
  },
  {
    id: 'clients',
    title: 'Client Management',
    description: 'Add your clients here with their name and branding. Once added, you can connect them to any calendar and generate a shareable approval link in seconds.',
  },
  {
    id: 'create',
    title: 'Create Your First Calendar',
    description: 'Hit the New Calendar button to set up your first client. Add your posts, set the dates, and share the link — your client gets a clean approval page with zero back and forth.',
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 🚀',
    description: 'You\'re ready to send your first calendar to a client. Hit New Calendar to get started — it takes less than 2 minutes.',
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
              <h3 className="text-xl font-bold text-gray-900 mb-2 break-words">
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
                      ? 'w-8 bg-blue-600'
                      : index < currentStep
                      ? 'w-2 bg-blue-400'
                      : 'w-2 bg-gray-300'
                  }`}
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
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
              >
                {isLastStep ? (
                  <>
                    New Calendar
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
