"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Eye, Loader2, Package } from "lucide-react";
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

interface Bundle {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  color: string;
  published: boolean;
  featured: boolean;
  order: number;
  views: number;
  createdAt: string; // ISO string instead of Date
  _count: {
    workflows: number;
  };
}

interface BundlesListProps {
  bundles: Bundle[];
}

export function BundlesList({ bundles: initialBundles }: BundlesListProps) {
  const [bundles, setBundles] = useState(initialBundles);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bundleToDelete, setBundleToDelete] = useState<Bundle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDeleteClick = (bundle: Bundle) => {
    setBundleToDelete(bundle);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bundleToDelete) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/bundles/${bundleToDelete.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete bundle");
      }

      // Remove bundle from list
      setBundles(bundles.filter((b) => b.id !== bundleToDelete.id));

      toast.success("Bundle deleted successfully");
      setDeleteDialogOpen(false);
      setBundleToDelete(null);

      // Refresh the page to update counts
      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete bundle");
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
              <th className="text-left py-3 px-4 font-medium text-foreground">Workflows</th>
              <th className="text-left py-3 px-4 font-medium text-foreground">Status</th>
              <th className="text-left py-3 px-4 font-medium text-foreground">Order</th>
              <th className="text-left py-3 px-4 font-medium text-foreground">Views</th>
              <th className="text-left py-3 px-4 font-medium text-foreground">Created</th>
              <th className="text-right py-3 px-4 font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bundles.map((bundle) => (
              <tr key={bundle.id} className="border-b hover:bg-muted/50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    {bundle.icon ? (
                      <span className="text-lg">{bundle.icon}</span>
                    ) : (
                      <Package className="h-5 w-5" style={{ color: bundle.color }} />
                    )}
                    <div>
                      <p className="font-medium">{bundle.name}</p>
                      <p className="text-sm text-muted-foreground">{bundle.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Badge variant="outline" className="text-xs">
                    {bundle._count.workflows} workflows
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <div className="flex flex-col gap-1">
                    <Badge
                      variant={bundle.published ? "default" : "secondary"}
                      className="w-fit text-xs"
                    >
                      {bundle.published ? "Published" : "Draft"}
                    </Badge>
                    {bundle.featured && (
                      <Badge variant="outline" className="w-fit text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-muted-foreground">{bundle.order}</span>
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Eye className="h-3 w-3" /> {bundle.views}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-muted-foreground">
                  {new Date(bundle.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-end gap-2">
                    <Link href={`/bundles/${bundle.slug}`} target="_blank">
                      <Button variant="ghost" size="sm" title="View">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/bundles/${bundle.id}/edit`}>
                      <Button variant="ghost" size="sm" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Delete"
                      onClick={() => handleDeleteClick(bundle)}
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
              This will permanently delete the bundle{" "}
              <span className="font-semibold text-foreground">
                &quot;{bundleToDelete?.name}&quot;
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
