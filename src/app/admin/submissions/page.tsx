"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getSubmissions, updateSubmissionStatus, deleteSubmission } from "./actions";
import { toast } from "sonner";
import { Loader2, Copy, Check, X, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";

type Submission = {
  id: string;
  workflowJson: any;
  category: string;
  submitterName: string | null;
  contactEmail: string | null;
  status: "PENDING" | "REVIEWED" | "REJECTED";
  createdAt: Date;
};

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const fetchSubmissions = async () => {
    setIsLoading(true);
    const result = await getSubmissions();
    if (result.success && result.data) {
      setSubmissions(result.data as Submission[]);
    } else {
      toast.error("Failed to load submissions");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleStatusUpdate = async (id: string, status: "PENDING" | "REVIEWED" | "REJECTED") => {
    const result = await updateSubmissionStatus(id, status);
    if (result.success) {
      toast.success(`Status updated to ${status}`);
      fetchSubmissions();
    } else {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this submission?")) {
      const result = await deleteSubmission(id);
      if (result.success) {
        toast.success("Submission deleted");
        fetchSubmissions();
      } else {
        toast.error("Failed to delete submission");
      }
    }
  };

  const copyJson = (json: any) => {
    navigator.clipboard.writeText(JSON.stringify(json, null, 2));
    toast.success("JSON copied to clipboard");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Submissions</h1>
        <p className="text-gray-400 mt-1">Review community submitted workflows</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending & Reviewed</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Submitter</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No submissions found
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-mono text-xs">
                      {format(new Date(submission.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{submission.submitterName || "Anonymous"}</span>
                        <span className="text-xs text-gray-500">{submission.contactEmail}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {submission.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          submission.status === "PENDING"
                            ? "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
                            : submission.status === "REVIEWED"
                            ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                            : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                        }
                      >
                        {submission.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyJson(submission.workflowJson)}
                          title="Copy JSON"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedSubmission(submission)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Submission Details</DialogTitle>
                              <DialogDescription>
                                Submitted by {submission.submitterName || "Anonymous"} on{" "}
                                {format(new Date(submission.createdAt), "PPP")}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 mt-4">
                              <div className="flex justify-between items-center">
                                <h3 className="font-semibold">Workflow JSON</h3>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyJson(submission.workflowJson)}
                                >
                                  <Copy className="mr-2 h-4 w-4" />
                                  Copy JSON
                                </Button>
                              </div>
                              <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-96">
                                {JSON.stringify(submission.workflowJson, null, 2)}
                              </pre>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {submission.status === "PENDING" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-500 hover:text-green-600 hover:bg-green-500/10"
                              onClick={() => handleStatusUpdate(submission.id, "REVIEWED")}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                              onClick={() => handleStatusUpdate(submission.id, "REJECTED")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-red-500"
                          onClick={() => handleDelete(submission.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
