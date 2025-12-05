"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Key, Shield, ExternalLink } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
}

export default function ApiKeyModal({ isOpen, onClose, onSave }: ApiKeyModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    // Load existing API key from localStorage
    const savedKey = localStorage.getItem("gemini_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!apiKey.trim()) {
      return;
    }
    localStorage.setItem("gemini_api_key", apiKey.trim());
    onSave(apiKey.trim());
    onClose();
  };

  const handleClear = () => {
    localStorage.removeItem("gemini_api_key");
    setApiKey("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-black border-2 border-primary rounded-lg shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-primary/10 border-2 border-primary rounded-lg flex items-center justify-center">
              <Key className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-mono text-white uppercase tracking-tight">
                Add Your API Key
              </h2>
              <p className="text-sm text-gray-400 font-mono">
                Required to use AI Workflow Builder
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Privacy Notice */}
          <div className="bg-primary/5 border-2 border-primary/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white font-mono">
                  🔒 Your Privacy Matters
                </p>
                <p className="text-xs text-gray-300 font-mono leading-relaxed">
                  Your API key is stored <strong className="text-primary">locally in your browser only</strong>. 
                  We never send it to our servers or store it anywhere else. It's used directly to communicate 
                  with Google's Gemini AI on your behalf.
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white font-mono uppercase">
              How to Get Your API Key:
            </h3>
            <ol className="space-y-2 text-sm text-gray-300 font-mono">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span>
                  Visit{" "}
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Google AI Studio
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span>Sign in with your Google account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>Click "Create API Key" and copy it</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">4.</span>
                <span>Paste it below and you're ready to go! 🚀</span>
              </li>
            </ol>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-white font-mono uppercase">
              Google Gemini API Key
            </label>
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIza..."
                className="font-mono border-2 pr-20"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white font-mono"
              >
                {showKey ? "HIDE" : "SHOW"}
              </button>
            </div>
            <p className="text-xs text-gray-400 font-mono">
              Your key starts with "AIza" and is about 39 characters long
            </p>
          </div>

          {/* Free Tier Info */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <p className="text-xs text-gray-300 font-mono">
              <strong className="text-primary">💡 Good News:</strong> Google Gemini offers a generous 
              free tier with 15 requests per minute. Perfect for building workflows!
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              className="flex-1 font-mono font-bold"
              size="lg"
            >
              <Key className="h-4 w-4 mr-2" />
              SAVE API KEY
            </Button>
            {apiKey && (
              <Button
                onClick={handleClear}
                variant="outline"
                className="font-mono border-2"
                size="lg"
              >
                CLEAR
              </Button>
            )}
          </div>

          {/* Footer Note */}
          <p className="text-xs text-center text-gray-500 font-mono">
            By using this feature, you agree to Google's{" "}
            <a
              href="https://ai.google.dev/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Terms of Service
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
