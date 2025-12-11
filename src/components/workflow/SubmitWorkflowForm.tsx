"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { submitWorkflow } from "@/app/(public)/submit-workflow/actions";
import { toast } from "sonner";
import { Loader2, Send, Code, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SubmitWorkflowFormProps {
  categories: string[];
}

export default function SubmitWorkflowForm({ categories }: SubmitWorkflowFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showCredit, setShowCredit] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);

    const result = await submitWorkflow(formData);

    if (result.success) {
      setIsSuccess(true);
      toast.success("Workflow submitted successfully! Thank you for contributing.");
    } else {
      toast.error(result.error || "Failed to submit workflow");
    }
    setIsSubmitting(false);
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-md w-full bg-black/50 backdrop-blur-xl border-primary/20 relative z-10 mx-auto">
          <CardContent className="pt-8 text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 relative">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              <Heart className="h-10 w-10 text-primary fill-primary relative z-10" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white font-mono mb-2">Legendary!</h2>
              <p className="text-gray-400 font-mono text-sm leading-relaxed">
                Your workflow has been beamed to our review team. You're not just sharing code; you're saving someone hours of their life.
              </p>
            </div>
            <Button 
              onClick={() => setIsSuccess(false)} 
              variant="outline" 
              className="mt-4 font-mono w-full border-primary/30 hover:bg-primary/10 hover:text-primary transition-all"
            >
              Submit Another Masterpiece
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-black/40 backdrop-blur-md border-white/10 shadow-2xl overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-primary via-purple-500 to-blue-500" />
        <CardHeader>
          <CardTitle className="font-mono text-xl">Submission Terminal</CardTitle>
          <CardDescription className="font-mono">
            Paste your JSON. We handle the rest.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="workflowJson" className="font-mono text-xs uppercase tracking-wider text-gray-400">
                Workflow JSON <span className="text-red-500">*</span>
              </Label>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-purple-600 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative">
                  <Code className="absolute top-3 left-3 h-4 w-4 text-gray-500" />
                  <Textarea
                    id="workflowJson"
                    name="workflowJson"
                    placeholder='{"nodes": [...], "connections": {...}}'
                    className="min-h-[200px] font-mono text-xs bg-black border-white/10 focus:border-primary pl-10 resize-none"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="font-mono text-xs uppercase tracking-wider text-gray-400">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select name="category" required>
                <SelectTrigger className="bg-black/50 border-white/10 font-mono h-12">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="font-mono capitalize">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 rounded-lg border border-white/10 bg-white/5 space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="showCredit" 
                  checked={showCredit}
                  onCheckedChange={(checked) => setShowCredit(checked as boolean)}
                  className="border-white/30 data-[state=checked]:bg-primary data-[state=checked]:text-black"
                />
                <Label 
                  htmlFor="showCredit" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none"
                >
                  I want to be credited for this workflow
                </Label>
              </div>

              <AnimatePresence>
                {showCredit && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-4 pt-2"
                  >
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="submitterName" className="font-mono text-xs uppercase tracking-wider text-gray-400">
                          Your Name
                        </Label>
                        <Input
                          id="submitterName"
                          name="submitterName"
                          placeholder="John Doe"
                          className="bg-black/50 border-white/10 font-mono"
                          required={showCredit}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail" className="font-mono text-xs uppercase tracking-wider text-gray-400">
                          Email (Private)
                        </Label>
                        <Input
                          id="contactEmail"
                          name="contactEmail"
                          type="email"
                          placeholder="john@example.com"
                          className="bg-black/50 border-white/10 font-mono"
                          required={showCredit}
                        />
                        <p className="text-[10px] text-gray-500 font-mono">
                          Only used if we need to contact you. Never shared publicly.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="authorUrl" className="font-mono text-xs uppercase tracking-wider text-gray-400">
                          Social Link (Optional)
                        </Label>
                        <Input
                          id="authorUrl"
                          name="authorUrl"
                          placeholder="https://twitter.com/johndoe"
                          className="bg-black/50 border-white/10 font-mono"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="pt-2">
              <div className="space-y-2">
                <Label htmlFor="captchaAnswer" className="font-mono text-xs uppercase tracking-wider text-gray-400">
                  Human Check <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-4">
                  <div className="bg-white/5 px-4 py-3 rounded border border-white/10 font-mono text-sm tracking-widest">
                    2 + 8 = ?
                  </div>
                  <Input
                    id="captchaAnswer"
                    name="captchaAnswer"
                    placeholder="?"
                    className="bg-black/50 border-white/10 font-mono w-24 text-center"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-14 font-mono text-lg bg-primary hover:bg-primary/90 text-black font-bold relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    Launch Workflow
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
