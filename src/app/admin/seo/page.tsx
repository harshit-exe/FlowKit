"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  RefreshCw,
  FileText,
  Search,
  Globe,
  ExternalLink,
  CheckCircle2,
  Link as LinkIcon,
  Copy
} from "lucide-react";

export default function AdminSEOPage() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const regenerateSitemap = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/sitemap", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to regenerate sitemap");

      const data = await response.json();
      setStats(data.stats);
      toast.success("Sitemap regenerated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to regenerate sitemap");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/sitemap");
      if (!response.ok) throw new Error("Failed to fetch stats");

      const data = await response.json();
      setStats(data.stats);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch sitemap stats");
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard!");
  };

  // Fetch stats on mount
  useState(() => {
    fetchStats();
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-mono uppercase">
          SEO MANAGEMENT
        </h1>
        <p className="text-muted-foreground mt-2 font-mono">
          Manage sitemap, robots.txt, and SEO configuration
        </p>
      </div>

      {/* Sitemap Card */}
      <Card className="border-2 font-mono">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="font-mono uppercase tracking-wider flex items-center gap-2">
                <FileText className="h-5 w-5" />
                SITEMAP GENERATOR
              </CardTitle>
              <CardDescription className="font-mono mt-2">
                Automatically generated sitemap for search engines
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono border-2">
              AUTO-GENERATED
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border-2 border-border">
                <p className="text-sm text-muted-foreground font-mono uppercase">Total URLs</p>
                <p className="text-2xl font-bold font-mono">{stats.totalUrls}</p>
              </div>
              <div className="p-4 border-2 border-border">
                <p className="text-sm text-muted-foreground font-mono uppercase">Static Pages</p>
                <p className="text-2xl font-bold font-mono">{stats.staticPages || 4}</p>
              </div>
              <div className="p-4 border-2 border-border">
                <p className="text-sm text-muted-foreground font-mono uppercase">Workflows</p>
                <p className="text-2xl font-bold font-mono">{stats.workflowPages}</p>
              </div>
              <div className="p-4 border-2 border-border">
                <p className="text-sm text-muted-foreground font-mono uppercase">Categories</p>
                <p className="text-2xl font-bold font-mono">{stats.categoryPages}</p>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={regenerateSitemap}
              disabled={loading}
              className="font-mono border-2"
              variant="outline"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  REGENERATING...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  REGENERATE SITEMAP
                </>
              )}
            </Button>
            <Button
              onClick={() => window.open("https://www.flowkit.in/sitemap.xml", "_blank")}
              variant="outline"
              className="font-mono border-2"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              VIEW SITEMAP
            </Button>
          </div>

          <div className="p-4 bg-muted/30 border-2 border-border">
            <p className="text-sm font-mono mb-2">
              <strong>SITEMAP URL:</strong>
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-background border-2 border-border text-xs">
                https://www.flowkit.in/sitemap.xml
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyUrl("https://www.flowkit.in/sitemap.xml")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Robots.txt Card */}
      <Card className="border-2 font-mono">
        <CardHeader>
          <CardTitle className="font-mono uppercase tracking-wider flex items-center gap-2">
            <Search className="h-5 w-5" />
            ROBOTS.TXT
          </CardTitle>
          <CardDescription className="font-mono">
            Configure how search engines crawl your site
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-mono">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span>Configured and active</span>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => window.open("https://www.flowkit.in/robots.txt", "_blank")}
              variant="outline"
              className="font-mono border-2"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              VIEW ROBOTS.TXT
            </Button>
          </div>

          <div className="p-4 bg-muted/30 border-2 border-border">
            <p className="text-sm font-mono mb-2">
              <strong>ROBOTS.TXT URL:</strong>
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-background border-2 border-border text-xs">
                https://www.flowkit.in/robots.txt
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyUrl("https://www.flowkit.in/robots.txt")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 bg-muted/30 border-2 border-border">
            <p className="text-sm font-mono mb-2">
              <strong>ALLOWED BOTS:</strong>
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="font-mono">Googlebot</Badge>
              <Badge variant="outline" className="font-mono">GPTBot (OpenAI)</Badge>
              <Badge variant="outline" className="font-mono">Claude-Web</Badge>
              <Badge variant="outline" className="font-mono">ChatGPT-User</Badge>
              <Badge variant="outline" className="font-mono">Google-Extended</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Google Search Console Card */}
      <Card className="border-2 font-mono">
        <CardHeader>
          <CardTitle className="font-mono uppercase tracking-wider flex items-center gap-2">
            <Globe className="h-5 w-5" />
            GOOGLE SEARCH CONSOLE
          </CardTitle>
          <CardDescription className="font-mono">
            Submit sitemap and monitor search performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 text-sm font-mono">
            <p><strong>1. Submit Sitemap:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Go to Google Search Console</li>
              <li>Navigate to Sitemaps section</li>
              <li>Add new sitemap: <code className="bg-muted px-1">sitemap.xml</code></li>
              <li>Click Submit</li>
            </ul>
          </div>

          <Button
            onClick={() => window.open("https://search.google.com/search-console", "_blank")}
            className="font-mono border-2"
            variant="outline"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            OPEN SEARCH CONSOLE
          </Button>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card className="border-2 font-mono">
        <CardHeader>
          <CardTitle className="font-mono uppercase tracking-wider flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            QUICK LINKS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start font-mono border-2"
            onClick={() => window.open("https://search.google.com/search-console", "_blank")}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Google Search Console
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start font-mono border-2"
            onClick={() => window.open("https://www.bing.com/webmasters", "_blank")}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Bing Webmaster Tools
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start font-mono border-2"
            onClick={() => window.open("https://pagespeed.web.dev/", "_blank")}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            PageSpeed Insights
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start font-mono border-2"
            onClick={() => window.open("https://validator.schema.org/", "_blank")}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Schema Markup Validator
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
