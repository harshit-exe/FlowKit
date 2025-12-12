"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { updateWorkflowStatsOffsetsAction, getWorkflowRealStats } from "@/app/admin/actions";
import { Loader2 } from "lucide-react";

interface SystemHealthMonitorProps {
  workflows: { id: string; name: string; slug: string }[];
}

export function SystemHealthMonitor({ workflows }: SystemHealthMonitorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  
  // These hold the "Total Displayed" values (Real + Offset)
  const [totals, setTotals] = useState({
    views: 0,
    downloads: 0,
    upvotes: 0,
    downvotes: 0,
    saves: 0,
  });

  // Keep track of real stats to calculate offsets on save
  const [realStats, setRealStats] = useState({
    views: 0,
    downloads: 0,
    upvotes: 0,
    downvotes: 0,
    saves: 0,
  });

  const [clickCount, setClickCount] = useState(0);

  // Secret activation: 5 clicks on the trigger within 2 seconds
  useEffect(() => {
    if (clickCount === 0) return;

    const timer = setTimeout(() => {
      setClickCount(0);
    }, 2000);

    if (clickCount >= 5) {
      setIsOpen(true);
      setClickCount(0);
    }

    return () => clearTimeout(timer);
  }, [clickCount]);

  // Fetch stats when workflow is selected
  useEffect(() => {
    if (!selectedWorkflowId) return;

    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const { real, offsets } = await getWorkflowRealStats(selectedWorkflowId);
        setRealStats(real);
        setTotals({
          views: real.views + (offsets.views || 0),
          downloads: real.downloads + (offsets.downloads || 0),
          upvotes: real.upvotes + (offsets.upvotes || 0),
          downvotes: real.downvotes + (offsets.downvotes || 0),
          saves: real.saves + (offsets.saves || 0),
        });
      } catch (error) {
        toast.error("Failed to fetch workflow stats");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [selectedWorkflowId]);

  const handleSave = async () => {
    if (!selectedWorkflowId) {
      toast.error("Please select a workflow");
      return;
    }

    // Calculate offsets: Offset = Desired Total - Real
    const newOffsets = {
      views: totals.views - realStats.views,
      downloads: totals.downloads - realStats.downloads,
      upvotes: totals.upvotes - realStats.upvotes,
      downvotes: totals.downvotes - realStats.downvotes,
      saves: totals.saves - realStats.saves,
    };

    try {
      await updateWorkflowStatsOffsetsAction(selectedWorkflowId, newOffsets);
      toast.success("System health metrics updated");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to update metrics");
    }
  };

  return (
    <>
      {/* Hidden Trigger Area - Bottom Right Corner */}
      <div
        className="fixed bottom-0 right-0 w-10 h-10 z-50 cursor-default opacity-0 hover:opacity-100"
        onClick={() => setClickCount((prev) => prev + 1)}
        title="System Monitor"
      />

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>System Health Monitor</DialogTitle>
            <DialogDescription>
              Adjust the public-facing metrics for the selected workflow.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="workflow" className="text-right">
                Target
              </Label>
              <select
                id="workflow"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedWorkflowId}
                onChange={(e) => setSelectedWorkflowId(e.target.value)}
              >
                <option value="" disabled>Select a workflow</option>
                {workflows.map((wf) => (
                  <option key={wf.id} value={wf.id}>
                    {wf.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedWorkflowId && (
              isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="views" className="text-right">
                      Total Views
                    </Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input
                        id="views"
                        type="number"
                        value={totals.views}
                        onChange={(e) => setTotals({ ...totals, views: parseInt(e.target.value) || 0 })}
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        (Real: {realStats.views})
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="downloads" className="text-right">
                      Total Downloads
                    </Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input
                        id="downloads"
                        type="number"
                        value={totals.downloads}
                        onChange={(e) => setTotals({ ...totals, downloads: parseInt(e.target.value) || 0 })}
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        (Real: {realStats.downloads})
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="upvotes" className="text-right">
                      Total Upvotes
                    </Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input
                        id="upvotes"
                        type="number"
                        value={totals.upvotes}
                        onChange={(e) => setTotals({ ...totals, upvotes: parseInt(e.target.value) || 0 })}
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        (Real: {realStats.upvotes})
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="downvotes" className="text-right">
                      Total Downvotes
                    </Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input
                        id="downvotes"
                        type="number"
                        value={totals.downvotes}
                        onChange={(e) => setTotals({ ...totals, downvotes: parseInt(e.target.value) || 0 })}
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        (Real: {realStats.downvotes})
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="saves" className="text-right">
                      Total Saves
                    </Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input
                        id="saves"
                        type="number"
                        value={totals.saves}
                        onChange={(e) => setTotals({ ...totals, saves: parseInt(e.target.value) || 0 })}
                      />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        (Real: {realStats.saves})
                      </span>
                    </div>
                  </div>
                </>
              )
            )}
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSave} disabled={isLoading || !selectedWorkflowId}>
              Update Metrics
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
