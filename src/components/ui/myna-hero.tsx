"use client";

import * as React from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BarChart,
  Workflow,
  Menu,
  Plug,
  Sparkles,
  Zap,
  TrendingUp,
  Shield,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion, useAnimation, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { HoverPreview } from "@/components/ui/hover-preview";
import { ThemeToggle } from "@/components/theme-toggle";

const navigationItems = [
  { title: "WORKFLOWS", href: "/workflows" },
  { title: "CATEGORIES", href: "#categories" },
  { title: "AI BUILDER", href: "/ai-builder" },
  { title: "ABOUT", href: "#about" },
];

const labels = [
  { icon: Sparkles, label: "Production Ready" },
  { icon: Shield, label: "Well Documented" },
  { icon: Zap, label: "AI Powered" },
];

const features = [
  {
    icon: Shield,
    label: "Production Ready",
    description: "Every workflow is tested, documented, and ready to deploy to your n8n instance immediately.",
  },
  {
    icon: TrendingUp,
    label: "Well Documented",
    description: "Complete setup guides, use cases, and step-by-step instructions for every workflow.",
  },
  {
    icon: Zap,
    label: "AI Powered",
    description: "Generate custom workflows using our AI builder powered by Google Gemini.",
  },
];

interface MynaHeroProps {
  totalWorkflows?: number;
}

export function MynaHero({ totalWorkflows = 150 }: MynaHeroProps) {
  const controls = useAnimation();
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  React.useEffect(() => {
    if (isInView) {
      controls.start("visible");
    }
  }, [controls, isInView]);

  const titleWords = [
    "AUTOMATE",
    "EVERYTHING",
    "WITH",
    "N8N",
    "WORKFLOWS",
  ];

  return (
    <div className="container mx-auto px-4 min-h-screen relative">
      <header>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center space-x-2">
              <Workflow className="h-8 w-8 text-primary" />
              <span className="font-mono text-xl font-bold">FlowKit</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="text-sm font-mono text-foreground hover:text-primary transition-colors"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Link href="/workflows">
              <Button
                variant="default"
                className="rounded-none hidden md:inline-flex bg-primary hover:bg-primary/90 font-mono"
              >
                GET STARTED <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <nav className="flex flex-col gap-6 mt-6">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="text-sm font-mono text-foreground hover:text-primary transition-colors"
                    >
                      {item.title}
                    </Link>
                  ))}
                  <div className="flex items-center justify-between px-3">
                    <span className="text-sm font-medium text-foreground">Theme</span>
                    <ThemeToggle />
                  </div>
                  <Link href="/workflows">
                    <Button className="cursor-pointer rounded-none bg-primary hover:bg-primary/90 font-mono w-full">
                      GET STARTED <ArrowRight className="ml-1 w-4 h-4" />
                    </Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main>
        <section className="container py-24">
          <div className="flex flex-col items-center text-center">
            <motion.h1
              initial={{ filter: "blur(10px)", opacity: 0, y: 50 }}
              animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative font-mono text-4xl font-bold sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl mx-auto leading-tight"
            >
              {titleWords.map((text, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: index * 0.15,
                    duration: 0.6
                  }}
                  className="inline-block mx-2 md:mx-4"
                >
                  {text}
                </motion.span>
              ))}
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="mx-auto mt-8 max-w-2xl"
            >
              <HoverPreview totalWorkflows={totalWorkflows} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8, duration: 0.6 }}
              className="mt-12 flex flex-wrap justify-center gap-6"
            >
              {labels.map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 1.8 + (index * 0.15),
                    duration: 0.6,
                    type: "spring",
                    stiffness: 100,
                    damping: 10
                  }}
                  className="flex items-center gap-2 px-6"
                >
                  <feature.icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-mono">{feature.label}</span>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 2.4,
                duration: 0.6,
                type: "spring",
                stiffness: 100,
                damping: 10
              }}
            >
              <Link href="/workflows">
                <Button
                  size="lg"
                  className="cursor-pointer rounded-none mt-12 bg-primary hover:bg-primary/90 font-mono"
                >
                  GET STARTED <ArrowRight className="ml-1 w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        <section className="container" ref={ref}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 3.0,
              duration: 0.6,
              type: "spring",
              stiffness: 100,
              damping: 10
            }}
            className="text-center text-4xl font-mono font-bold mb-6"
          >
            Why Choose FlowKit?
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.2, duration: 0.6 }}
            className="grid md:grid-cols-3 max-w-6xl mx-auto"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 3.2 + (index * 0.2),
                  duration: 0.6,
                  type: "spring",
                  stiffness: 100,
                  damping: 10
                }}
                className="flex flex-col items-center text-center p-8 border"
              >
                <div className="mb-6 rounded-full bg-primary/10 p-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-4 text-xl font-mono font-bold">
                  {feature.label}
                </h3>
                <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </section>
      </main>
    </div>
  );
}
