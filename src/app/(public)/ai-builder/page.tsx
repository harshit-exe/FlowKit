import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Lock, Sparkles, Zap, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import WorkflowBuilder from "@/components/ai-builder/WorkflowBuilder";

export default async function AIBuilderPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('/grid.png')] bg-[size:60px_60px] opacity-5 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-4xl w-full space-y-12 relative z-10">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-poppins tracking-tight">
              Unlock the Power of <br />
              <span className="text-primary">AI Automation</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-mono">
              Build complex n8n workflows in seconds using natural language. 
              Join thousands of developers automating their work.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
              <Sparkles className="h-8 w-8 text-yellow-400 mb-4" />
              <h3 className="text-lg font-bold font-mono mb-2">Text to Workflow</h3>
              <p className="text-sm text-muted-foreground">
                Describe what you want to automate, and our AI will build the entire workflow structure for you.
              </p>
            </Card>
            <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
              <BrainCircuit className="h-8 w-8 text-blue-400 mb-4" />
              <h3 className="text-lg font-bold font-mono mb-2">Smart Optimization</h3>
              <p className="text-sm text-muted-foreground">
                Automatically optimize your workflows for performance and error handling best practices.
              </p>
            </Card>
            <Card className="p-6 bg-white/5 border-white/10 backdrop-blur-sm">
              <Zap className="h-8 w-8 text-purple-400 mb-4" />
              <h3 className="text-lg font-bold font-mono mb-2">Instant Deploy</h3>
              <p className="text-sm text-muted-foreground">
                Get production-ready JSON that you can import directly into your n8n instance.
              </p>
            </Card>
          </div>

          <div className="flex flex-col items-center gap-4">
            <Button asChild size="lg" className="rounded-full text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-black font-bold">
              <Link href="/login?callbackUrl=/ai-builder">
                Sign In to Access AI Builder
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground font-mono">
              Free for all registered users
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <WorkflowBuilder />
    </div>
  );
}
