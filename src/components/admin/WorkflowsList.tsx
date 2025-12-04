"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Eye, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Workflow {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  published: boolean;
  featured: boolean;
  views: number;
  downloads: number;
  createdAt: Date;
  categories: {
    category: {
      id: string;
      name: string;
      icon?: string | null;
    };
  }[];
}

interface WorkflowsListProps {
  workflows: Workflow[];
}

export function WorkflowsList({ workflows: initialWorkflows }: WorkflowsListProps) {
  const [workflows, setWorkflows] = useState(initialWorkflows);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workflowToDelete, setWorkflowToDelete] = useState<Workflow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteClick = (workflow: Workflow) => {
    setWorkflowToDelete(workflow);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!workflowToDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/workflows/${workflowToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete workflow");
      }

      // Remove workflow from list
      setWorkflows(workflows.filter((w) => w.id !== workflowToDelete.id));

      toast.success("Workflow deleted successfully");
      setDeleteDialogOpen(false);
      setWorkflowToDelete(null);

      // Refresh the page to update counts
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete workflow");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-medium text-foreground">Name</th>
              <th className="text-left py-3 px-4 font-medium text-foreground">Categories</th>
              <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
              <th className="text-left py-3 px-4 font-medium text-foreground">Stats</th>
              <th className="text-left py-3 px-4 font-medium text-foreground">Created</th>
              <th className="text-right py-3 px-4 font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {workflows.map((workflow) => (
              <tr key={workflow.id} className="border-b hover:bg-muted/50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {workflow.icon && <span className="text-lg">{workflow.icon}</span>}
                    <div>
                      <p className="font-medium">{workflow.name}</p>
                      <p className="text-sm text-muted-foreground">{workflow.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-wrap gap-1">
                    {workflow.categories.slice(0, 2).map((cat) => (
                      <Badge key={cat.category.id} variant="outline" className="text-xs">
                        {cat.category.icon} {cat.category.name}
                      </Badge>
                    ))}
                    {workflow.categories.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{workflow.categories.length - 2}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col gap-1">
                    <Badge
                      variant={workflow.published ? "default" : "secondary"}
                      className="w-fit text-xs"
                    >
                      {workflow.published ? "Published" : "Draft"}
                    </Badge>
                    {workflow.featured && (
                      <Badge variant="outline" className="w-fit text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {workflow.views}
                      </span>
                      <span>↓ {workflow.downloads}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">
                  {new Date(workflow.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-end gap-2">
                    <Link href={`/workflows/${workflow.slug}`} target="_blank">
                      <Button variant="ghost" size="sm" title="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/workflows/${workflow.id}/edit`}>
                      <Button variant="ghost" size="sm" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Delete"
                      onClick={() => handleDeleteClick(workflow)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the workflow{" "}
              <span className="font-semibold text-foreground">
                &quot;{workflowToDelete?.name}&quot;
              </span>
              . This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
