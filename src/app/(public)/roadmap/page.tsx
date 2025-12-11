"use client";

import { useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { 
  Rocket, 
  Zap, 
  Users, 
  Star, 
  GitBranch, 
  CheckCircle2, 
  Sparkles,
  Crown,
  Lock,
  Cpu,
  Globe,
  Code2,
  Workflow
} from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- Creative Data ---

const MILESTONES = [
  {
    date: "THE SINGULARITY",
    title: "Neural Integration",
    description: "The moment FlowKit became sentient. We integrated the Gemini AI engine, allowing users to manifest complex automation workflows simply by describing their intent.",
    icon: Sparkles,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    glow: "shadow-[0_0_30px_-5px_rgba(168,85,247,0.3)]",
    status: "LIVE NOW",
    features: [
      "Generative AI Architect",
      "Real-time Neural Streaming",
      "Context-Aware Auto-fill"
    ]
  },
  {
    date: "THE HIVE MIND",
    title: "Collective Intelligence",
    description: "We shattered the silos. By enabling global sharing, rating, and forking of workflows, we created a self-improving ecosystem of automation knowledge.",
    icon: Globe,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    glow: "shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]",
    status: "DEPLOYED",
    features: [
      "Global Workflow Repository",
      "Community Peer Review",
      "Social Automation Profiles"
    ]
  },
  {
    date: "GENESIS PROTOCOL",
    title: "The Big Bang",
    description: "Where it all began. We forged the core architecture from pure code and caffeine, establishing a secure, scalable foundation for the future of work.",
    icon: Cpu,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    glow: "shadow-[0_0_30px_-5px_rgba(249,115,22,0.3)]",
    status: "ESTABLISHED",
    features: [
      "Next.js 14 Core",
      "Quantum-Resistant Auth",
      "Command Center (Admin)"
    ]
  }
];

const UPCOMING = [
  {
    title: "The Bazaar",
    subtitle: "Workflow Marketplace",
    description: "Monetize your genius. A decentralized economy for automation creators.",
    icon: Crown,
    votes: 1240,
    color: "from-yellow-500/20 to-amber-500/5"
  },
  {
    title: "Synapse Link",
    subtitle: "Multiplayer Editing",
    description: "Real-time collaborative construction. Build together, instantly.",
    icon: Users,
    votes: 856,
    color: "from-blue-500/20 to-cyan-500/5"
  },
  {
    title: "Fortress Gate",
    subtitle: "Enterprise SSO",
    description: "Military-grade access control for large-scale organizations.",
    icon: Lock,
    votes: 642,
    color: "from-red-500/20 to-rose-500/5"
  }
];

// --- Components ---

function CircuitLine() {
  return (
    <div className="absolute inset-0 pointer-events-none opacity-20">
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}

function TimelineItem({ item, index }: { item: typeof MILESTONES[0], index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.2 }}
      className={cn(
        "relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group",
        "mb-24 md:mb-32"
      )}
    >
      {/* Center Node */}
      <div className="absolute left-4 md:left-1/2 w-12 h-12 -ml-6 flex items-center justify-center z-20">
        <div className={cn("w-4 h-4 rounded-full border-4 border-background relative z-10", item.color.replace('text-', 'bg-'))} />
        <div className={cn("absolute inset-0 rounded-full opacity-20 animate-ping", item.color.replace('text-', 'bg-'))} />
        <div className={cn("absolute inset-0 rounded-full blur-md opacity-50", item.color.replace('text-', 'bg-'))} />
      </div>

      {/* Connector Line (Desktop) */}
      <div className="hidden md:block absolute left-1/2 top-1/2 w-1/2 h-px bg-gradient-to-r from-border to-transparent -z-10 origin-left group-odd:rotate-180" />

      {/* Content Card */}
      <div className="w-full md:w-[calc(50%-3rem)] ml-16 md:ml-0">
        <motion.div
          whileHover={{ y: -5, scale: 1.01 }}
          className={cn(
            "relative p-8 rounded-3xl border backdrop-blur-xl transition-all duration-500",
            "bg-black/40 hover:bg-black/60",
            item.border,
            item.glow
          )}
        >
          {/* Decorative Corner */}
          <div className={cn("absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/5 to-transparent rounded-tr-3xl")} />

          <div className="flex items-center justify-between mb-6">
            <Badge variant="outline" className={cn("font-mono tracking-widest text-xs py-1 px-3 border-2", item.color, item.border)}>
              {item.date}
            </Badge>
            <div className="flex items-center gap-2">
              <span className={cn("w-2 h-2 rounded-full animate-pulse", item.color.replace('text-', 'bg-'))} />
              <span className={cn("text-[10px] font-mono font-bold tracking-wider opacity-70", item.color)}>
                {item.status}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className={cn("p-3 rounded-2xl border border-white/10", item.bg)}>
              <item.icon className={cn("w-8 h-8", item.color)} />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold font-mono uppercase tracking-tighter text-white">
              {item.title}
            </h3>
          </div>

          <p className="text-lg text-muted-foreground mb-8 leading-relaxed font-light">
            {item.description}
          </p>

          <div className="grid grid-cols-1 gap-3">
            {item.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm font-mono text-gray-400 group/feature">
                <div className={cn("w-1.5 h-1.5 rounded-full transition-colors", item.color.replace('text-', 'bg-'), "group-hover/feature:scale-150")} />
                <span className="group-hover/feature:text-white transition-colors">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function FutureCard({ item, index }: { item: typeof UPCOMING[0], index: number }) {
  const [votes, setVotes] = useState(item.votes);
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = () => {
    if (!hasVoted) {
      setVotes(v => v + 1);
      setHasVoted(true);
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#FF6B35', '#004E89'],
        shapes: ['star']
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15 }}
      className="relative group h-full"
    >
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700",
        item.color
      )} />
      
      <div className="relative h-full p-8 rounded-3xl border border-white/10 bg-black/80 backdrop-blur-xl hover:border-white/20 transition-all duration-300 flex flex-col">
        <div className="flex justify-between items-start mb-6">
          <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors border border-white/5">
            <item.icon className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors" />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleVote}
            className={cn(
              "font-mono text-xs gap-2 border-white/10 bg-black/50 hover:bg-primary hover:border-primary hover:text-white transition-all duration-300",
              hasVoted && "bg-primary border-primary text-white"
            )}
          >
            <Star className={cn("w-3 h-3", hasVoted && "fill-white")} />
            {votes.toLocaleString()}
          </Button>
        </div>
        
        <div className="mb-4">
          <h4 className="text-xs font-mono text-primary mb-2 uppercase tracking-widest opacity-80">{item.subtitle}</h4>
          <h3 className="text-xl font-bold font-mono text-white group-hover:text-primary transition-colors">{item.title}</h3>
        </div>
        
        <p className="text-sm text-muted-foreground leading-relaxed mt-auto">{item.description}</p>
      </div>
    </motion.div>
  );
}

export default function RoadmapPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const handleEasterEgg = () => {
    confetti({
      particleCount: 200,
      spread: 120,
      origin: { y: 0.3 },
      colors: ['#FF6B35', '#004E89', '#ffffff'],
      ticks: 300
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] overflow-hidden selection:bg-primary/30 text-white">
      <CircuitLine />
      
      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary origin-left z-50 shadow-[0_0_20px_rgba(255,107,53,0.5)]"
        style={{ scaleX }}
      />

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 px-4">
        {/* Background Glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] animate-pulse" />
          <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px]" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, type: "spring" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 backdrop-blur-md mb-8 hover:bg-primary/10 transition-colors cursor-default">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase">System Status: Operational</span>
            </div>
            
            <h1 
              className="text-6xl md:text-8xl font-black font-mono uppercase tracking-tighter mb-8 cursor-pointer group"
              onClick={handleEasterEgg}
            >
              <span className="inline-block bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 group-hover:to-primary/80 transition-all duration-500">
                The
              </span>
              <br />
              <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-secondary animate-gradient-x bg-[length:200%_auto]">
                Evolution
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
              Witness the <span className="text-white font-medium">metamorphosis</span> of automation. 
              From a single line of code to a global neural network of creators.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="relative max-w-6xl mx-auto px-4 pb-40">
        {/* Central Circuit Line */}
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-secondary/50 to-transparent md:-ml-px z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-32 bg-gradient-to-b from-primary to-transparent" />
        </div>

        <div className="relative z-10">
          {MILESTONES.map((item, index) => (
            <TimelineItem key={index} item={item} index={index} />
          ))}
        </div>
      </section>

      {/* Community Pulse Section */}
      <section className="relative py-32 border-y border-white/5 bg-black/40 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: "Stargazers", value: "1.2k+", icon: Star, color: "text-yellow-400", glow: "shadow-yellow-500/20" },
              { label: "Active Nodes", value: "5,000+", icon: Users, color: "text-blue-400", glow: "shadow-blue-500/20" },
              { label: "Flows Executed", value: "10k+", icon: Zap, color: "text-purple-400", glow: "shadow-purple-500/20" },
              { label: "Code Commits", value: "450+", icon: GitBranch, color: "text-green-400", glow: "shadow-green-500/20" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring" }}
                className="group relative"
              >
                <div className="flex justify-center mb-6">
                  <div className={cn(
                    "p-4 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                    "shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)]",
                    stat.glow
                  )}>
                    <stat.icon className={cn("w-8 h-8", stat.color)} />
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-black font-mono mb-3 tracking-tighter text-white">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-mono uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Section */}
      <section className="relative py-40 bg-gradient-to-b from-black to-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-24">
            <Badge variant="outline" className="mb-4 font-mono border-white/20 text-white/60">
              PHASE 2.0
            </Badge>
            <h2 className="text-4xl md:text-6xl font-black font-mono uppercase tracking-tighter mb-6 text-white">
              The Horizon
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light">
              We are building the tools of tomorrow. <br/>
              <span className="text-primary font-medium">Cast your vote</span> and steer the ship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {UPCOMING.map((item, index) => (
              <FutureCard key={index} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
