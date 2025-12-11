"use client";

import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProgressStep = {
  id: string;
  label: string;
  status: "pending" | "active" | "completed" | "error";
};

interface WorkflowProgressProps {
  steps: ProgressStep[];
  currentMessage?: string;
}

export function WorkflowProgress({ steps, currentMessage }: WorkflowProgressProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {step.status === "completed" ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : step.status === "active" ? (
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              ) : step.status === "error" ? (
                <XCircle className="h-6 w-6 text-red-500" />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground/30" />
              )}
            </div>
            <div className="flex-1">
              <p
                className={cn(
                  "font-mono text-sm uppercase tracking-wide transition-colors",
                  step.status === "active"
                    ? "text-white font-bold"
                    : step.status === "completed"
                    ? "text-green-500"
                    : step.status === "error"
                    ? "text-red-500"
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {currentMessage && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <p className="text-sm font-mono text-primary animate-pulse">
            {">"} {currentMessage}
          </p>
        </div>
      )}
    </div>
  );
}
