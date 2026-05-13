import { Link } from 'react-router-dom';
import { ArrowLeft, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'How do I share a calendar with my client?',
    answer: 'Open any calendar, click "Copy Share Link" and send it to your client. No login required on their end.'
  },
  {
    question: 'How do I export approved posts?',
    answer: 'Inside any calendar, click "Export Approved Posts" to download a CSV of all approved content.'
  },
  {
    question: 'Can my client edit the posts directly?',
    answer: 'Clients can request edits with a comment but cannot edit posts directly — all changes go through you.'
  },
  {
    question: 'How do I cancel my subscription?',
    answer: 'Go to Profile → Manage Subscription to cancel anytime. You keep access until the end of your billing period.'
  },
  {
    question: 'How do I add a new client?',
    answer: 'Click "Clients" in the sidebar, then "Add Client". Fill in their name and optionally upload their logo.'
  }
];

export function HelpPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f3ed' }}>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="p-8 md:p-12">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-10 h-10" style={{ color: '#c8a84b' }} />
            <h1 className="text-4xl font-bold" style={{ fontFamily: 'Playfair Display, serif', color: '#1a1a18' }}>
              Help Center
            </h1>
          </div>
          <p className="text-gray-600 mb-8">
            Find answers to common questions about using Content Charm.
          </p>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="p-6 bg-white"
                style={{
                  border: '1px solid #ece6dc',
                  borderRadius: '10px'
                }}
              >
                <h2 className="text-lg font-bold mb-2" style={{ color: '#1a1a18' }}>
                  {faq.question}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div
            className="mt-12 p-6 rounded-lg"
            style={{ backgroundColor: '#1a1a18' }}
          >
            <h3 className="text-lg font-semibold text-white mb-2">
              Still have questions?
            </h3>
            <p className="text-white mb-4 opacity-90">
              We're here to help! Email us and we'll get back to you within 24 hours.
            </p>
            <a
              href="mailto:hello@rachelsavitt.com"
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#c8a84b' }}
            >
              Email Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
