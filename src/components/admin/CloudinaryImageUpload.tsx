"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface CloudinaryImageUploadProps {
  value?: string;
  onChange: (url: string, publicId?: string) => void;
  folder?: string;
  label?: string;
  description?: string;
}

export function CloudinaryImageUpload({
  value,
  onChange,
  folder = "flowkit-workflows",
  label = "Workflow Image",
  description = "Upload an image for this workflow (max 10MB, JPG/PNG/WebP/GIF)",
}: CloudinaryImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error
    setError(null);

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setError("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Upload failed");
      }

      const data = await response.json();
      onChange(data.url, data.publicId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
        {value ? (
          <div className="relative">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
              <Image
                src={value}
                alt="Uploaded image"
                fill
                className="object-cover"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleRemove}
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            {uploading ? (
              <>
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Choose Image
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  or drag and drop
                </p>
              </>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
          disabled={uploading}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
