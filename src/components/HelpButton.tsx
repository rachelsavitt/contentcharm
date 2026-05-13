import { useState } from 'react';
import { HelpCircle, MessageCircle, BookOpen, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function HelpButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleOptionClick = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:shadow-xl flex items-center justify-center z-40"
        aria-label="Help"
      >
        {isOpen ? <X className="w-6 h-6" /> : <HelpCircle className="w-6 h-6" />}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed bottom-24 right-6 w-72 bg-white rounded-lg shadow-xl border border-slate-200 z-40 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700">
              <h3 className="text-white font-semibold text-lg">How can we help?</h3>
            </div>
            <div className="p-2">
              <button
                onClick={() => handleOptionClick('/help')}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors text-left"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Read the guide</p>
                  <p className="text-sm text-slate-600">Find answers to common questions</p>
                </div>
              </button>

              <a
                href="mailto:hello@rachelsavitt.com"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 rounded-lg transition-colors text-left"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Email us</p>
                  <p className="text-sm text-slate-600">hello@rachelsavitt.com</p>
                </div>
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}
