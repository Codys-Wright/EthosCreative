"use client";

import { useState } from "react";
import { UploadDropzone } from "@/utils/uploadthing";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Image from "next/image";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  className?: string;
}

export function ImageUploader({
  value,
  onChange,
  className = "",
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div className={`space-y-4 ${className}`}>
      {value ? (
        <div className="relative aspect-video rounded-md overflow-hidden border border-border">
          <div className="absolute top-2 right-2 z-10">
            <Button
              variant="destructive"
              size="icon"
              className="h-7 w-7 rounded-full"
              type="button"
              onClick={() => onChange("")}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Image
            src={value}
            alt="Uploaded image"
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <UploadDropzone
          endpoint="imageUploader"
          onUploadBegin={() => setIsUploading(true)}
          onClientUploadComplete={(res) => {
            setIsUploading(false);
            if (res && res[0]) {
              onChange(res[0].url);
            }
          }}
          onUploadError={(error: Error) => {
            console.error("Upload Error:", error.message);
            setIsUploading(false);
          }}
          className="ut-button:bg-primary ut-label:text-foreground border-dashed border-2 p-4 rounded-md"
        />
      )}
      {isUploading && (
        <p className="text-sm text-muted-foreground">Uploading...</p>
      )}
    </div>
  );
}
