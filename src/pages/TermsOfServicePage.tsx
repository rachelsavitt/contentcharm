import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function TermsOfServicePage() {
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
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Terms of Service</h1>
          <p className="text-sm text-slate-500 mb-8">Last Updated: March 2026</p>

          <div className="prose prose-slate max-w-none">
            <p className="text-lg text-slate-700 mb-8">
              Welcome to Content Charm. By using our service, you agree to these Terms of Service. Please read them carefully.
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Description of Service</h2>
              <p className="text-slate-700 mb-4">
                Content Charm is a web-based platform that enables users to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Create and manage social media content calendars</li>
                <li>Generate AI-powered content suggestions and captions</li>
                <li>Organize and collaborate with clients</li>
                <li>Upload, store, and manage media assets</li>
                <li>Export and share content calendars</li>
              </ul>
              <p className="text-slate-700 mt-4">
                Content Charm is a software-as-a-service (SaaS) tool designed to help content creators, marketers, and agencies streamline their social media workflow.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Account Registration and Security</h2>
              <p className="text-slate-700 mb-4">
                To use Content Charm, you must:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Be at least 18 years old</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your password and account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
              <p className="text-slate-700 mt-4">
                You are responsible for all activity that occurs under your account.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. User Content and Ownership</h2>
              <p className="text-slate-700 mb-4">
                <strong>You retain all ownership rights to the content you create, upload, or share through Content Charm.</strong> This includes:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Social media posts and captions</li>
                <li>Images, videos, and other media files</li>
                <li>Calendar data and client information</li>
              </ul>
              <p className="text-slate-700 mt-4">
                By uploading content to Content Charm, you grant us a limited license to store, process, and display your content solely for the purpose of providing the service to you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. User Responsibilities</h2>
              <p className="text-slate-700 mb-4">
                You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>The accuracy, legality, and appropriateness of all content you create or upload</li>
                <li>Obtaining necessary rights, licenses, and permissions for any content you use</li>
                <li>Your relationships with clients, including contracts, deliverables, and payments</li>
                <li>Ensuring your use of Content Charm complies with all applicable laws and regulations</li>
                <li>Backing up your important data (we recommend regular exports)</li>
              </ul>
              <p className="text-slate-700 mt-4">
                <strong>Content Charm is a tool to assist your workflow. We are not responsible for your client relationships, content quality, or business outcomes.</strong>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Payment Terms and Subscriptions</h2>
              <p className="text-slate-700 mb-4">
                Content Charm operates on a subscription basis:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Subscriptions are billed monthly or annually in advance</li>
                <li>All subscriptions automatically renew unless you cancel before the renewal date</li>
                <li>You can cancel your subscription at any time through your account settings</li>
                <li>Upon cancellation, you will retain access until the end of your current billing period</li>
                <li>We reserve the right to change our pricing with 30 days notice to existing subscribers</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Refund Policy</h3>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li><strong>Monthly Plans:</strong> You may request a full refund within 7 days of your initial purchase or renewal</li>
                <li><strong>Annual Plans:</strong> No refunds are provided for annual subscriptions</li>
                <li>Refunds are processed within 5-10 business days</li>
                <li>We reserve the right to refuse refunds for accounts terminated due to Terms of Service violations</li>
              </ul>

              <p className="text-slate-700 mt-4">
                All payments are processed securely through Stripe. We do not store your complete credit card information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Acceptable Use Policy</h2>
              <p className="text-slate-700 mb-4">
                You may not use Content Charm to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Upload or create illegal, harmful, or offensive content</li>
                <li>Violate any intellectual property rights or privacy rights</li>
                <li>Distribute spam, malware, or phishing content</li>
                <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
                <li>Interfere with or disrupt the service</li>
                <li>Use the service for any fraudulent or deceptive purpose</li>
                <li>Resell or redistribute the service without our written permission</li>
                <li>Use automated tools to scrape or collect data from the service</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Account Termination</h2>
              <p className="text-slate-700 mb-4">
                We reserve the right to suspend or terminate your account if:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>You violate these Terms of Service</li>
                <li>You engage in fraudulent or illegal activity</li>
                <li>Your account remains inactive for an extended period</li>
                <li>Required by law or legal process</li>
              </ul>
              <p className="text-slate-700 mt-4">
                Upon termination, your access to the service will cease, and your data may be deleted according to our data retention policy. We recommend exporting your data regularly.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Service Availability and Changes</h2>
              <p className="text-slate-700">
                While we strive to provide reliable service, Content Charm is provided "as is" and "as available." We do not guarantee uninterrupted access and may:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4 mt-4">
                <li>Perform maintenance or updates that temporarily affect availability</li>
                <li>Modify, suspend, or discontinue features with or without notice</li>
                <li>Change these Terms of Service (we will notify you of material changes)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Limitation of Liability</h2>
              <p className="text-slate-700 mb-4">
                To the maximum extent permitted by law:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Content Charm and its owners, employees, and affiliates are not liable for any indirect, incidental, consequential, or punitive damages</li>
                <li>We are not responsible for lost profits, revenue, data, or business opportunities</li>
                <li>Our total liability to you for any claims arising from your use of the service is limited to the amount you paid us in the 12 months preceding the claim</li>
                <li>We are not liable for third-party services, content, or actions</li>
              </ul>
              <p className="text-slate-700 mt-4">
                <strong>You use Content Charm at your own risk. We provide the tools, but you are responsible for how you use them and the outcomes of your work.</strong>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Indemnification</h2>
              <p className="text-slate-700">
                You agree to indemnify and hold harmless Content Charm and its affiliates from any claims, damages, losses, or expenses (including legal fees) arising from your use of the service, your content, or your violation of these Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">11. Governing Law and Disputes</h2>
              <p className="text-slate-700 mb-4">
                These Terms are governed by the laws of the State of Tennessee, United States, without regard to conflict of law principles.
              </p>
              <p className="text-slate-700">
                Any disputes arising from these Terms or your use of Content Charm will be resolved through binding arbitration in Tennessee, except that either party may seek injunctive relief in court for violations of intellectual property rights.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">12. Contact Information</h2>
              <p className="text-slate-700">
                If you have questions about these Terms of Service, please contact us at:
              </p>
              <p className="text-slate-700 mt-4">
                <strong>Email:</strong> <a href="mailto:support@contentcharmai.com" className="text-blue-600 hover:text-blue-700 font-medium">support@contentcharmai.com</a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">13. Entire Agreement</h2>
              <p className="text-slate-700">
                These Terms of Service, together with our Privacy Policy, constitute the entire agreement between you and Content Charm regarding your use of the service.
              </p>
            </section>

            <div className="mt-12 p-6 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-600">
                <strong>Note:</strong> These Terms of Service are a starting point template. You should have a qualified attorney review and customize them for your specific business needs before launch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
