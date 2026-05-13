import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-sm text-slate-500 mb-8">Last Updated: March 2026</p>

          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-700 mb-8">
              At Content Charm, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your personal information when you use our service.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Information We Collect</h2>
              <p className="text-slate-700 mb-4">
                When you use Content Charm, we collect the following types of information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li><strong>Account Information:</strong> Your name, email address, and password</li>
                <li><strong>Content Data:</strong> Social media posts, calendars, images, videos, and other content you create or upload</li>
                <li><strong>Client Information:</strong> Names, logos, and other details you add for client management</li>
                <li><strong>Payment Information:</strong> Billing details processed securely through Stripe (we do not store complete credit card numbers)</li>
                <li><strong>Usage Data:</strong> Information about how you interact with our service, including features used and content created</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device information, and cookies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">How We Use Your Information</h2>
              <p className="text-slate-700 mb-4">
                We use your information to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Provide and maintain the Content Charm service</li>
                <li>Process your payments and manage subscriptions</li>
                <li>Send transactional emails related to your account and service usage</li>
                <li>Improve our product and develop new features</li>
                <li>Provide customer support and respond to your inquiries</li>
                <li>Ensure security and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Data Sharing and Third-Party Services</h2>
              <p className="text-slate-700 mb-4">
                <strong>We do not sell your personal data to third parties.</strong> We only share your information with trusted service providers who help us operate Content Charm:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li><strong>Stripe:</strong> Payment processing and subscription management</li>
                <li><strong>Supabase:</strong> Secure data storage and database hosting</li>
              </ul>
              <p className="text-slate-700 mt-4">
                These providers are bound by strict confidentiality agreements and may only use your data to provide services on our behalf.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Cookies and Tracking</h2>
              <p className="text-slate-700 mb-4">
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Keep you signed in to your account</li>
                <li>Remember your preferences</li>
                <li>Analyze how you use our service to improve functionality</li>
                <li>Prevent fraud and enhance security</li>
              </ul>
              <p className="text-slate-700 mt-4">
                You can control cookies through your browser settings, but disabling cookies may affect your ability to use certain features.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Data Security</h2>
              <p className="text-slate-700">
                We implement industry-standard security measures to protect your data, including encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Your Rights</h2>
              <p className="text-slate-700 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Export your data in a portable format</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Data Deletion</h2>
              <p className="text-slate-700">
                If you would like to request deletion of your account and all associated data, please contact us at <a href="mailto:support@contentcharmai.com" className="text-blue-600 hover:text-blue-700 font-medium">support@contentcharmai.com</a>. We will process your request within 30 days, subject to legal retention requirements.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Children's Privacy</h2>
              <p className="text-slate-700">
                Content Charm is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected such information, please contact us immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Changes to This Policy</h2>
              <p className="text-slate-700">
                We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a prominent notice in the application. Continued use of Content Charm after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">Contact Us</h2>
              <p className="text-slate-700">
                If you have questions or concerns about this Privacy Policy or how we handle your data, please contact us at:
              </p>
              <p className="text-slate-700 mt-4">
                <strong>Email:</strong> <a href="mailto:support@contentcharmai.com" className="text-blue-600 hover:text-blue-700 font-medium">support@contentcharmai.com</a>
              </p>
            </section>

            <div className="mt-12 p-6 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-600">
                <strong>Note:</strong> This Privacy Policy is a starting point template. You should have a qualified attorney review and customize it for your specific business needs before launch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
