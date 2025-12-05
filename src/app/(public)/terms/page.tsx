import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | FlowKit - Usage Guidelines",
  description: "FlowKit's terms of service. Understand your rights and responsibilities when using our n8n workflow automation platform. Fair, transparent, and user-friendly terms.",
  openGraph: {
    title: "Terms of Service | FlowKit",
    description: "Clear and fair terms for using FlowKit's workflow automation platform.",
  },
};

export default function TermsPage() {
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
            TERMS OF SERVICE
          </h1>
          <p className="text-gray-400 font-mono">
            Last Updated: December 5, 2024
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 font-mono text-gray-300 leading-relaxed">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
            <p className="mb-4">
              Welcome to FlowKit! By accessing or using our platform at{" "}
              <a href="https://flowkit.in" className="text-primary hover:underline">flowkit.in</a>, 
              you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, 
              please do not use our service.
            </p>
            <p>
              FlowKit provides curated, production-ready n8n workflows to help you automate tasks efficiently. 
              These Terms govern your use of our platform and workflows.
            </p>
          </section>

          {/* License and Usage */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. License and Usage Rights</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.1 Open Source License</h3>
            <p className="mb-4">
              FlowKit is released under the <strong className="text-primary">MIT License</strong>. This means:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You can use FlowKit workflows for personal and commercial projects</li>
              <li>You can modify and distribute the workflows</li>
              <li>You can create derivative works</li>
              <li>Attribution is appreciated but not required</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">2.2 Platform Usage</h3>
            <p className="mb-4">You agree to use FlowKit responsibly and not to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Distribute malware or harmful code</li>
              <li>Attempt to hack, disrupt, or overload our servers</li>
              <li>Scrape or harvest data without permission</li>
              <li>Impersonate others or provide false information</li>
            </ul>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
            <p className="mb-4">
              When you create an account or join our waitlist:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You must provide accurate and complete information</li>
              <li>You are responsible for maintaining account security</li>
              <li>You must notify us immediately of any unauthorized access</li>
              <li>You are responsible for all activities under your account</li>
              <li>One person or entity may maintain only one account</li>
            </ul>
          </section>

          {/* Workflows and Content */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Workflows and Content</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3 mt-6">4.1 Workflow Quality</h3>
            <p className="mb-4">
              We strive to provide high-quality, production-ready workflows. However:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Workflows are provided "as is" without warranties</li>
              <li>We do not guarantee workflows will meet your specific needs</li>
              <li>You are responsible for testing workflows before production use</li>
              <li>We are not liable for any damages from workflow usage</li>
            </ul>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">4.2 User-Generated Content</h3>
            <p className="mb-4">
              If you submit workflows, feedback, or other content:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>You retain ownership of your content</li>
              <li>You grant us a license to use, display, and distribute it</li>
              <li>Your content must not violate any laws or third-party rights</li>
              <li>We may remove content that violates these Terms</li>
            </ul>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Intellectual Property</h2>
            <p className="mb-4">
              <strong>FlowKit Platform:</strong> The FlowKit website, branding, and original content are protected 
              by copyright and trademark laws. You may not copy, modify, or distribute them without permission.
            </p>
            <p className="mb-4">
              <strong>Workflows:</strong> Individual workflows are licensed under MIT License (see section 2.1).
            </p>
            <p>
              <strong>Third-Party Content:</strong> Some workflows may integrate with third-party services. 
              You must comply with their terms of service.
            </p>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Disclaimers and Limitations</h2>
            
            <h3 className="text-xl font-semibold text-white mb-3 mt-6">6.1 No Warranty</h3>
            <p className="mb-4">
              FLOWKIT IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, 
              INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
            </p>

            <h3 className="text-xl font-semibold text-white mb-3 mt-6">6.2 Limitation of Liability</h3>
            <p className="mb-4">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, FLOWKIT SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, 
              CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
            </p>
          </section>

          {/* Service Availability */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Service Availability</h2>
            <p className="mb-4">
              We strive to keep FlowKit available 24/7, but:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>We may experience downtime for maintenance or updates</li>
              <li>We do not guarantee uninterrupted or error-free service</li>
              <li>We may modify or discontinue features at any time</li>
              <li>We will provide notice of significant changes when possible</li>
            </ul>
          </section>

          {/* Termination */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Termination</h2>
            <p className="mb-4">
              We may terminate or suspend your access to FlowKit:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>If you violate these Terms</li>
              <li>If you engage in fraudulent or illegal activities</li>
              <li>If required by law</li>
              <li>At our discretion, with or without notice</li>
            </ul>
            <p className="mt-4">
              You may stop using FlowKit at any time. Sections that should survive termination (like disclaimers 
              and limitations) will remain in effect.
            </p>
          </section>

          {/* Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Privacy</h2>
            <p>
              Your use of FlowKit is also governed by our{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              . Please review it to understand how we collect, use, and protect your data.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Changes to Terms</h2>
            <p className="mb-4">
              We may update these Terms from time to time. When we do:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>We will update the "Last Updated" date</li>
              <li>We will notify you of material changes via email or website notice</li>
              <li>Continued use after changes constitutes acceptance</li>
            </ul>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">11. Governing Law</h2>
            <p>
              These Terms are governed by the laws of India. Any disputes will be resolved in the courts of India. 
              If any provision is found unenforceable, the remaining provisions will continue in effect.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">12. Contact Us</h2>
            <p className="mb-4">
              Questions about these Terms? Contact us:
            </p>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-2">
              <p><strong>Email:</strong> <a href="mailto:legal@flowkit.in" className="text-primary hover:underline">legal@flowkit.in</a></p>
              <p><strong>GitHub:</strong> <a href="https://github.com/harshit-exe/flowkit" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">github.com/harshit-exe/flowkit</a></p>
              <p><strong>Website:</strong> <a href="https://flowkit.in" className="text-primary hover:underline">flowkit.in</a></p>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="border-t border-white/10 pt-8">
            <h2 className="text-2xl font-bold text-white mb-4">Acknowledgment</h2>
            <p>
              BY USING FLOWKIT, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
