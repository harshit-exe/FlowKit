"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateAIProvider } from "@/app/admin/settings/actions";
import { AIProvider } from "@/lib/ai-provider";
import { Loader2 } from "lucide-react";

interface AISettingsProps {
  initialProvider: AIProvider;
}

export function AISettings({ initialProvider }: AISettingsProps) {
  const [provider, setProvider] = useState<AIProvider>(initialProvider);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateAIProvider(provider);
      if (result.success) {
        toast.success("AI Provider updated successfully");
      } else {
        toast.error("Failed to update AI provider");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>AI Provider</Label>
            <p className="text-sm text-gray-400">
              Select the primary AI provider for generating workflows and content.
            </p>
          </div>
          
          <RadioGroup 
            value={provider} 
            onValueChange={(value: string) => setProvider(value as AIProvider)}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer transition-colors ${provider === 'groq' ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent/50'}`}>
              <RadioGroupItem value="groq" id="groq" />
              <Label htmlFor="groq" className="flex-1 cursor-pointer">
                <div className="font-semibold">Groq (Llama 3)</div>
                <div className="text-xs text-gray-400">Fast inference, recommended for text generation</div>
              </Label>
            </div>

            <div className={`flex items-center space-x-2 border rounded-lg p-4 cursor-pointer transition-colors ${provider === 'gemini' ? 'border-primary bg-primary/10' : 'border-border hover:bg-accent/50'}`}>
              <RadioGroupItem value="gemini" id="gemini" />
              <Label htmlFor="gemini" className="flex-1 cursor-pointer">
                <div className="font-semibold">Google Gemini</div>
                <div className="text-xs text-gray-400">Multimodal capabilities, required for image generation</div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving || provider === initialProvider}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
