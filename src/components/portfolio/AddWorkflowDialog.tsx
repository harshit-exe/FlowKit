/**
 * Add Your Own Workflow to Portfolio
 * Client-side component for adding user's OWN workflows by pasting n8n JSON
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AddWorkflowDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [workflowJson, setWorkflowJson] = useState('');
  const [extractedData, setExtractedData] = useState<any>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [featured, setFeatured] = useState(false);
  const router = useRouter();

  const handleExtractMetadata = async () => {
    if (!workflowJson.trim()) {
      alert('Please paste your n8n workflow JSON');
      return;
    }

    setExtracting(true);
    try {
      // Parse JSON first
      const parsed = JSON.parse(workflowJson);
      
      // Extract metadata from n8n JSON
      const res = await fetch('/api/portfolio/workflows/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowJson: parsed }),
      });

      if (res.ok) {
        const data = await res.json();
        setExtractedData(data);
        setCustomTitle(data.name || '');
        setCustomDesc(data.description || '');
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to extract metadata');
      }
    } catch (error: any) {
      alert('Invalid JSON format: ' + error.message);
    } finally {
      setExtracting(false);
    }
  };

  const handleAddWorkflow = async () => {
    if (!extractedData) {
      alert('Please extract metadata first');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/portfolio/workflows/add-own', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowJson: JSON.parse(workflowJson),
          title: customTitle,
          description: customDesc,
          featured,
          extractedData,
        }),
      });

      if (res.ok) {
        setOpen(false);
        setWorkflowJson('');
        setExtractedData(null);
        setCustomTitle('');
        setCustomDesc('');
        setFeatured(false);
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to add workflow');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="font-mono">
          <Plus className="w-4 h-4 mr-2" />
          ADD YOUR WORKFLOW
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Add Your Own n8n Workflow
          </DialogTitle>
          <p className="text-sm text-muted-foreground font-mono mt-2">
            Paste your n8n workflow JSON and we'll automatically extract details
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* JSON Input */}
          {!extractedData && (
            <>
              <div>
                <label className="text-sm font-mono font-bold mb-2 block">
                  PASTE YOUR N8N WORKFLOW JSON
                </label>
                <Textarea
                  value={workflowJson}
                  onChange={(e) => setWorkflowJson(e.target.value)}
                  placeholder='{"nodes": [...], "connections": {...}, "name": "My Workflow"}'
                  className="font-mono text-xs h-64"
                />
              </div>

              <Button
                onClick={handleExtractMetadata}
                disabled={extracting || !workflowJson.trim()}
                className="w-full font-mono"
              >
                {extracting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    EXTRACTING METADATA...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    EXTRACT METADATA (AI)
                  </>
                )}
              </Button>
            </>
          )}

          {/* Extracted Data - Edit */}
          {extractedData && (
            <>
              <div className="border-2 border-primary bg-primary/10 p-4 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="font-mono font-bold text-sm text-primary">
                    METADATA EXTRACTED
                  </span>
                </div>
                <div className="text-xs font-mono space-y-1 text-muted-foreground">
                  <div>📊 Nodes: {extractedData.nodeCount}</div>
                  <div>🔗 Connections: {extractedData.connectionCount}</div>
                  <div>⚙️ Difficulty: {extractedData.difficulty}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-mono font-bold mb-2 block">
                  WORKFLOW TITLE *
                </label>
                <Input
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="E.g., Slack Notification Automation"
                  className="font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-mono font-bold mb-2 block">
                  DESCRIPTION *
                </label>
                <Textarea
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="Describe what your workflow does..."
                  className="font-mono"
                  rows={4}
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="featured" className="text-sm font-mono cursor-pointer">
                  ⭐ Mark as Featured (displays first on your portfolio)
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => {
                    setExtractedData(null);
                    setWorkflowJson('');
                  }}
                  variant="outline"
                  className="flex-1 font-mono"
                >
                  START OVER
                </Button>
                <Button
                  onClick={handleAddWorkflow}
                  disabled={loading || !customTitle || !customDesc}
                  className="flex-1 font-mono"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ADDING...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      ADD TO PORTFOLIO
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
