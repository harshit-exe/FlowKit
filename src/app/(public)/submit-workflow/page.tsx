import { prisma } from "@/lib/prisma";
import SubmitWorkflowForm from "@/components/workflow/SubmitWorkflowForm";
import { Sparkles, Trophy, Users, Globe } from "lucide-react";
import * as motion from "framer-motion/client";

const categories = [
  "automation",
  "communication",
  "productivity",
  "data",
  "marketing",
  "development",
  "social",
  "ai",
];

export default async function SubmitWorkflowPage() {
  // Fetch stats from DB
  const [totalSubmissions, acceptedSubmissions, pendingSubmissions] = await Promise.all([
    prisma.workflowSubmission.count(),
    prisma.workflowSubmission.count({ where: { status: "REVIEWED" } }),
    prisma.workflowSubmission.count({ where: { status: "PENDING" } }),
  ]);

  // Base counts (fake it till you make it)
  const baseTotal = 46;
  const baseAccepted = 9;
  const basePending = 37;

  const displayTotal = baseTotal + totalSubmissions;
  const displayAccepted = baseAccepted + acceptedSubmissions;
  const displayPending = basePending + pendingSubmissions;

  return (
    <div className="min-h-screen bg-black text-white relative pt-24 pb-12 px-4">
       {/* Background Grid */}
       <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: 'url(/grid.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '112px 112px',
            opacity: 0.2,
          }}
        />

      <div className="max-w-5xl mx-auto relative z-10 grid lg:grid-cols-2 gap-12">
        {/* Left Column: Copy & Benefits */}
        <div>
          <div className="space-y-8 lg:sticky lg:top-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono mb-6">
              <Sparkles className="w-3 h-3 mr-2" />
              JOIN THE HALL OF FAME
            </span>
            <h1 className="text-4xl md:text-6xl font-bold font-mono mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 leading-tight">
              Share Your <br/> Automation <br/> Genius
            </h1>
            <p className="text-lg text-gray-400 font-mono leading-relaxed max-w-lg">
              Don't let your brilliant workflows gather dust. Share them with the community and become a recognized contributor.
            </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-6 py-4"
            >
              <div className="text-center">
                <div className="text-3xl font-bold font-mono text-white">{displayTotal}</div>
                <div className="text-xs text-gray-500 font-mono uppercase tracking-wider">Submissions</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <div className="text-3xl font-bold font-mono text-primary">{displayAccepted}</div>
                <div className="text-xs text-gray-500 font-mono uppercase tracking-wider">Accepted</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <div className="text-3xl font-bold font-mono text-yellow-500">{displayPending}</div>
                <div className="text-xs text-gray-500 font-mono uppercase tracking-wider">Under Review</div>
              </div>
            </motion.div>


          <div className="space-y-6">
             <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="p-2 bg-yellow-500/10 rounded-md">
                <Trophy className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-bold font-mono text-white mb-1">Earn Recognition</h3>
                <p className="text-sm text-gray-400 font-mono">Top contributors get featured badges and community shoutouts.</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="p-2 bg-blue-500/10 rounded-md">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-bold font-mono text-white mb-1">Help Thousands</h3>
                <p className="text-sm text-gray-400 font-mono">Your one workflow could save 1000+ hours for developers worldwide.</p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="p-2 bg-purple-500/10 rounded-md">
                <Globe className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-bold font-mono text-white mb-1">Open Source Impact</h3>
                <p className="text-sm text-gray-400 font-mono">Contribute to the ecosystem and build your developer portfolio.</p>
              </div>
            </motion.div>
          </div>
        </div>
        </div>

        {/* Right Column: Form */}
        <SubmitWorkflowForm categories={categories} />
      </div>
    </div>
  );
}
