"use client"

import { CredentialLink } from "@/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Lock, Copy, CheckCircle2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

interface CredentialSetupCardProps {
  credentialLink: CredentialLink
}

// Provider brand colors
const PROVIDER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Google: { bg: "bg-blue-50 dark:bg-blue-950/30", text: "text-blue-600 dark:text-blue-400", border: "border-blue-200 dark:border-blue-800" },
  LinkedIn: { bg: "bg-[#0A66C2]/10", text: "text-[#0A66C2]", border: "border-[#0A66C2]/30" },
  Slack: { bg: "bg-purple-50 dark:bg-purple-950/30", text: "text-purple-600 dark:text-purple-400", border: "border-purple-200 dark:border-purple-800" },
  GitHub: { bg: "bg-gray-100 dark:bg-gray-900", text: "text-gray-900 dark:text-gray-100", border: "border-gray-300 dark:border-gray-700" },
  Facebook: { bg: "bg-[#1877F2]/10", text: "text-[#1877F2]", border: "border-[#1877F2]/30" },
  Twitter: { bg: "bg-[#1DA1F2]/10", text: "text-[#1DA1F2]", border: "border-[#1DA1F2]/30" },
  OpenAI: { bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800" },
  Default: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30" },
}

export default function CredentialSetupCard({ credentialLink }: CredentialSetupCardProps) {
  const [showInstructions, setShowInstructions] = useState(false)
  const [copiedPermission, setCopiedPermission] = useState<string | null>(null)

  const colors = PROVIDER_COLORS[credentialLink.provider] || PROVIDER_COLORS.Default

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedPermission(label)
    toast.success(`Copied: ${label}`)
    setTimeout(() => setCopiedPermission(null), 2000)
  }

  return (
    <Card className={`border-2 ${colors.border} ${colors.bg} transition-all hover:shadow-lg`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="font-mono text-sm uppercase tracking-wider flex items-center gap-2">
              <Lock className={`h-4 w-4 ${colors.text}`} />
              <span className={colors.text}>{credentialLink.name}</span>
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              Provider: {credentialLink.provider}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Required Permissions */}
        {credentialLink.requiredPermissions && credentialLink.requiredPermissions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-mono font-bold uppercase text-muted-foreground">
              Required Permissions:
            </p>
            <div className="flex flex-wrap gap-2">
              {credentialLink.requiredPermissions.map((permission, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="font-mono text-xs gap-1 cursor-pointer hover:bg-accent"
                  onClick={() => copyToClipboard(permission, permission)}
                >
                  {permission}
                  {copiedPermission === permission ? (
                    <CheckCircle2 className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Setup Instructions (Expandable) */}
        {credentialLink.setupInstructions && (
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInstructions(!showInstructions)}
              className="font-mono text-xs px-0 hover:bg-transparent"
            >
              {showInstructions ? "▼" : "▶"} Setup Instructions
            </Button>
            
            {showInstructions && (
              <div className="bg-background/50 border-2 rounded-lg p-3">
                <pre className="text-xs font-mono whitespace-pre-wrap text-muted-foreground">
                  {credentialLink.setupInstructions}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            asChild
            className={`flex-1 font-mono gap-2 ${colors.text} border-2`}
            variant="outline"
          >
            <a href={credentialLink.setupUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
              Get Credentials
            </a>
          </Button>

          {credentialLink.documentationUrl && (
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="font-mono gap-1"
            >
              <a href={credentialLink.documentationUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3" />
                Docs
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
