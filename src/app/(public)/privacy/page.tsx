import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | FlowKit - Your Data, Your Control",
  description: "FlowKit's privacy policy. Learn how we protect your data, what information we collect, and your rights. Transparent, secure, and user-focused privacy practices.",
  openGraph: {
    title: "Privacy Policy | FlowKit",
    description: "Transparent privacy practices for FlowKit users. Your data, your control.",
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link 
            href="/" 
            className="text-primary hover:text-primary/80 font-mono text-sm mb-4 inline-block"
          >
            ← BACK TO HOME
          </Link>
          <h1 className="text-4xl sm:text-5xl font-bold font-mono mb-4 tracking-tight">
            PRIVACY POLICY
          </h1>
          <p className="text-gray-400 font-mono">
            Last Updated: December 5, 2024
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 font-mono text-gray-300 leading-relaxed">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="mb-4">
              Welcome to FlowKit. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy explains how we collect, use, and safeguard your information when you use our 
              n8n workflow automation platform.
            </p>
            <p>
              FlowKit is an open-source project (MIT License) that provides production-ready n8n workflows. 
              We believe in transparency and your right to control your data.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.1 Information You Provide</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Email Address:</strong> When you join our waitlist or sign up for updates</li>
              <li><strong>Workflow Data:</strong> Workflows you download or interact with</li>
              <li><strong>Feedback:</strong> Any comments, suggestions, or bug reports you submit</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.2 Automatically Collected Information</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Usage Data:</strong> Pages viewed, workflows accessed, time spent on site</li>
              <li><strong>Device Information:</strong> Browser type, operating system, IP address</li>
              <li><strong>Analytics:</strong> We use privacy-focused analytics to improve user experience</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
            <p className="mb-4">We use your information to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide access to FlowKit workflows and features</li>
              <li>Send you workflow updates and announcements (only if you opted in)</li>
              <li>Improve our platform based on usage patterns</li>
              <li>Respond to your inquiries and support requests</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* Data Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Data Sharing and Disclosure</h2>
            <p className="mb-4">
              <strong className="text-primary">We do not sell your personal data.</strong> We may share your information only in these circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Service Providers:</strong> Trusted third parties who help us operate (e.g., email service, hosting)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> Any other sharing will require your explicit permission</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Data Security</h2>
            <p className="mb-4">
              We implement industry-standard security measures to protect your data:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Encrypted data transmission (HTTPS/SSL)</li>
              <li>Secure database storage with access controls</li>
              <li>Regular security audits and updates</li>
              <li>Limited employee access to personal data</li>
            </ul>
            <p className="mt-4 text-gray-400">
              However, no method of transmission over the internet is 100% secure. We strive to protect your data 
              but cannot guarantee absolute security.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Your Privacy Rights</h2>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your data (right to be forgotten)</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing emails at any time</li>
              <li><strong>Data Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Object:</strong> Object to certain data processing activities</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at{" "}
              <a href="mailto:privacy@flowkit.in" className="text-primary hover:underline">
                privacy@flowkit.in
              </a>
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Cookies and Tracking</h2>
            <p className="mb-4">
              We use essential cookies to make FlowKit work properly. We also use analytics cookies to understand 
              how users interact with our platform.
            </p>
            <p>
              You can control cookies through your browser settings. Note that disabling cookies may affect 
              site functionality.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Third-Party Services</h2>
            <p className="mb-4">FlowKit may integrate with third-party services:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>GitHub:</strong> For workflow storage and version control</li>
              <li><strong>Analytics Providers:</strong> To understand usage patterns</li>
              <li><strong>Email Service:</strong> For transactional and marketing emails</li>
            </ul>
            <p className="mt-4 text-gray-400">
              These services have their own privacy policies. We encourage you to review them.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Children's Privacy</h2>
            <p>
              FlowKit is not intended for users under 13 years of age. We do not knowingly collect data from 
              children. If you believe we have collected data from a child, please contact us immediately.
            </p>
          </section>

          {/* International Users */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. International Data Transfers</h2>
            <p>
              Your data may be transferred to and processed in countries other than your own. We ensure 
              appropriate safeguards are in place to protect your data in accordance with this privacy policy.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Changes to This Policy</h2>
            <p className="mb-4">
              We may update this privacy policy from time to time. We will notify you of significant changes by:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Posting the new policy on this page</li>
              <li>Updating the "Last Updated" date</li>
              <li>Sending an email notification (for material changes)</li>
            </ul>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Contact Us</h2>
            <p className="mb-4">
              If you have questions about this privacy policy or our data practices, please contact us:
            </p>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-2">
              <p><strong>Email:</strong> <a href="mailto:privacy@flowkit.in" className="text-primary hover:underline">privacy@flowkit.in</a></p>
              <p><strong>GitHub:</strong> <a href="https://github.com/harshit-exe/flowkit" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">github.com/harshit-exe/flowkit</a></p>
              <p><strong>Website:</strong> <a href="https://flowkit.in" className="text-primary hover:underline">flowkit.in</a></p>
            </div>
          </section>

          {/* Open Source Notice */}
          <section className="border-t border-white/10 pt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Open Source Commitment</h2>
            <p>
              FlowKit is an open-source project (MIT License). Our code is transparent and available for review 
              on GitHub. We believe in building trust through transparency.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
