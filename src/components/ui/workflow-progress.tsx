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
  className?: string;
}

export function WorkflowProgress({
  steps,
  currentMessage,
  className,
}: WorkflowProgressProps) {
  return (
    <div className={cn("space-y-6 font-mono", className)}>
      {/* Progress Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {step.status === "completed" ? (
                <CheckCircle2 className="w-6 h-6 text-primary" />
              ) : step.status === "active" ? (
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              ) : step.status === "error" ? (
                <XCircle className="w-6 h-6 text-destructive" />
              ) : (
                <Circle className="w-6 h-6 text-muted-foreground" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-1">
              <div
                className={cn(
                  "text-sm font-bold uppercase tracking-wider",
                  step.status === "completed" && "text-primary",
                  step.status === "active" && "text-foreground",
                  step.status === "error" && "text-destructive",
                  step.status === "pending" && "text-muted-foreground"
                )}
              >
                STEP {index + 1}: {step.label}
              </div>

              {step.status === "active" && currentMessage && (
                <div className="text-xs text-muted-foreground border-l-2 border-primary pl-3 py-1">
                  {currentMessage}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="h-2 bg-muted border-2 border-border overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{
              width: `${
                (steps.filter((s) => s.status === "completed").length /
                  steps.length) *
                100
              }%`,
            }}
          />
        </div>
        <div className="text-xs text-muted-foreground text-center uppercase tracking-wider">
          {steps.filter((s) => s.status === "completed").length} / {steps.length}{" "}
          STEPS COMPLETED
        </div>
      </div>
    </div>
  );
}
