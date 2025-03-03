"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Upload, X, ImageIcon } from "lucide-react";

// Type for the image field renderer props
interface ImageRendererProps {
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
  maxSizeInMB?: number;
  aspectRatio?: number; // width/height
  showRemoveButton?: boolean;
  previewSize?: {
    width: number;
    height: number;
  };
}

/**
 * A specialized field renderer for image uploads and previews
 */
export function ImageRenderer({
  value,
  onChange,
  disabled = false,
  placeholder = "Upload an image",
  maxSizeInMB = 5,
  aspectRatio,
  showRemoveButton = true,
  previewSize = { width: 200, height: 200 },
}: ImageRendererProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      alert(`File size exceeds the maximum allowed size of ${maxSizeInMB}MB.`);
      return;
    }
    
    // Read the file and convert to data URL
    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // Reset the input to allow uploading the same file again
    e.target.value = '';
  };
  
  // Handle removing the image
  const handleRemoveImage = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle clicking the upload button
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="w-full">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        disabled={disabled}
        className="hidden"
      />
      
      {/* Image preview or placeholder */}
      <div 
        className="relative mb-3 rounded-md border-2 border-dashed border-muted flex items-center justify-center overflow-hidden"
        style={{ 
          width: previewSize.width, 
          height: previewSize.height,
          aspectRatio: aspectRatio ? `${aspectRatio}` : 'auto'
        }}
      >
        {value ? (
          // Show image preview
          <div className="relative w-full h-full">
            <Image
              src={value}
              alt={placeholder}
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-md"
            />
            
            {/* Remove button */}
            {showRemoveButton && !disabled && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1 bg-background rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          // Show upload placeholder
          <div className="flex flex-col items-center justify-center text-muted-foreground p-4">
            <ImageIcon className="h-12 w-12 mb-2" />
            <p className="text-sm text-center">{placeholder}</p>
          </div>
        )}
      </div>
      
      {/* Upload button */}
      {!disabled && (
        <Button
          type="button"
          variant="outline"
          onClick={handleUploadClick}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {value ? "Change Image" : "Upload Image"}
        </Button>
      )}
    </div>
  );
} 