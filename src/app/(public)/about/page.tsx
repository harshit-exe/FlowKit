import { Metadata } from "next";
import Link from "next/link";
import { Github, Mail, Zap, Code, Users, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "About FlowKit | Open Source n8n Workflow Automation Platform",
  description: "Learn about FlowKit - an open-source platform providing 150+ production-ready n8n workflows. Built by developers, for developers. MIT licensed and community-driven.",
  openGraph: {
    title: "About FlowKit | Open Source Workflow Automation",
    description: "Discover the story behind FlowKit and our mission to make workflow automation accessible to everyone.",
  },
};

export default function AboutPage() {
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
            ABOUT FLOWKIT
          </h1>
          <p className="text-xl text-gray-400 font-mono">
            Workflow automation made simple, powerful, and accessible.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-12 font-mono text-gray-300 leading-relaxed">
          {/* Mission */}
          <section>
            <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-lg mb-4">
              FlowKit exists to <strong className="text-primary">democratize workflow automation</strong>. 
              We believe that powerful automation tools shouldn't require weeks of setup or expensive consultants.
            </p>
            <p className="text-lg">
              We're building a curated library of production-ready n8n workflows that you can deploy in minutes, 
              not months. Every workflow is tested, documented, and optimized for real-world use.
            </p>
          </section>

          {/* Story */}
          <section className="border-t border-white/10 pt-12">
            <h2 className="text-3xl font-bold text-white mb-6">The Story</h2>
            <p className="mb-4">
              FlowKit started from a simple frustration: <strong>finding quality n8n workflows was hard</strong>.
            </p>
            <p className="mb-4">
              As developers, we spent countless hours building the same automation patterns over and over. 
              Email notifications, data syncing, API integrations - the same workflows, different projects.
            </p>
            <p className="mb-4">
              We thought: <em>"What if there was a library of battle-tested workflows that just work?"</em>
            </p>
            <p>
              So we built FlowKit. A platform where developers can find, download, and deploy production-ready 
              workflows in minutes. No more reinventing the wheel. No more debugging the same issues.
            </p>
          </section>

          {/* What We Offer */}
          <section className="border-t border-white/10 pt-12">
            <h2 className="text-3xl font-bold text-white mb-6">What We Offer</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-bold text-white">150+ Workflows</h3>
                </div>
                <p className="text-gray-400">
                  Curated collection of production-ready n8n workflows covering automation, integration, 
                  data processing, and more.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Code className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-bold text-white">100% Open Source</h3>
                </div>
                <p className="text-gray-400">
                  MIT licensed. Use, modify, and distribute freely. Built in public on GitHub with full transparency.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-bold text-white">Community-Driven</h3>
                </div>
                <p className="text-gray-400">
                  Built by developers, for developers. Contributions welcome. Your feedback shapes the platform.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-bold text-white">Always Free</h3>
                </div>
                <p className="text-gray-400">
                  No paywalls, no premium tiers. Every workflow is free to use, forever. Automation for everyone.
                </p>
              </div>
            </div>
          </section>

          {/* Values */}
          <section className="border-t border-white/10 pt-12">
            <h2 className="text-3xl font-bold text-white mb-6">Our Values</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">🎯 Quality Over Quantity</h3>
                <p className="text-gray-400">
                  Every workflow is tested, documented, and production-ready. We'd rather have 10 excellent 
                  workflows than 100 mediocre ones.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">🔓 Transparency</h3>
                <p className="text-gray-400">
                  Open source isn't just a license - it's a philosophy. Our code, our roadmap, and our 
                  decision-making are all public.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">🚀 Developer Experience</h3>
                <p className="text-gray-400">
                  We're developers building for developers. Clean code, clear documentation, and respect 
                  for your time.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-2">🌍 Accessibility</h3>
                <p className="text-gray-400">
                  Powerful automation shouldn't be locked behind enterprise pricing. FlowKit is free for 
                  everyone, everywhere.
                </p>
              </div>
            </div>
          </section>

          {/* Technology */}
          <section className="border-t border-white/10 pt-12">
            <h2 className="text-3xl font-bold text-white mb-6">Built With</h2>
            <p className="mb-4">
              FlowKit is built with modern, reliable technologies:
            </p>
            <ul className="grid md:grid-cols-2 gap-3">
              <li className="flex items-center gap-2">
                <span className="text-primary">▸</span>
                <span><strong>Next.js 14</strong> - React framework for production</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">▸</span>
                <span><strong>TypeScript</strong> - Type-safe development</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">▸</span>
                <span><strong>Prisma</strong> - Modern database ORM</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">▸</span>
                <span><strong>PostgreSQL</strong> - Reliable data storage</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">▸</span>
                <span><strong>Tailwind CSS</strong> - Utility-first styling</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">▸</span>
                <span><strong>n8n</strong> - Workflow automation engine</span>
              </li>
            </ul>
          </section>

          {/* Team */}
          <section className="border-t border-white/10 pt-12">
            <h2 className="text-3xl font-bold text-white mb-6">The Team</h2>
            <p className="mb-4">
              FlowKit is maintained by <strong className="text-primary">CipherLabs</strong> and a growing 
              community of contributors.
            </p>
            <p className="mb-6">
              We're a small team with a big vision: make workflow automation accessible to everyone. 
              We believe in building in public, shipping fast, and listening to our users.
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="https://github.com/harshit-exe/flowkit" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 py-3 transition-colors"
              >
                <Github className="h-5 w-5" />
                <span>View on GitHub</span>
              </a>
              <a 
                href="mailto:hello@flowkit.in"
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 py-3 transition-colors"
              >
                <Mail className="h-5 w-5" />
                <span>Get in Touch</span>
              </a>
            </div>
          </section>

          {/* Roadmap */}
          <section className="border-t border-white/10 pt-12">
            <h2 className="text-3xl font-bold text-white mb-6">What's Next</h2>
            <p className="mb-4">
              We're just getting started. Here's what's on the horizon:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">✓</span>
                <div>
                  <strong className="text-white">AI Workflow Builder</strong>
                  <p className="text-gray-400">Generate custom workflows with AI assistance</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">→</span>
                <div>
                  <strong className="text-white">Workflow Templates</strong>
                  <p className="text-gray-400">Customizable templates for common use cases</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">→</span>
                <div>
                  <strong className="text-white">Community Contributions</strong>
                  <p className="text-gray-400">Submit and share your own workflows</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary mt-1">→</span>
                <div>
                  <strong className="text-white">Integration Marketplace</strong>
                  <p className="text-gray-400">Pre-built integrations for popular services</p>
                </div>
              </li>
            </ul>
          </section>

          {/* CTA */}
          <section className="border-t border-white/10 pt-12">
            <div className="bg-gradient-to-r from-primary/10 to-orange-500/10 border border-primary/30 rounded-lg p-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Join the Movement</h2>
              <p className="text-lg text-gray-300 mb-6">
                FlowKit is more than a platform - it's a community of builders automating the future.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  href="/workflows"
                  className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  BROWSE WORKFLOWS
                </Link>
                <a 
                  href="https://github.com/harshit-exe/flowkit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                >
                  STAR ON GITHUB
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
