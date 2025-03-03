"use client";

import * as React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Upload, User, X } from "lucide-react";

// Type for the avatar field renderer props
interface AvatarRendererProps {
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  name?: string; // Used for fallback initials
  size?: "sm" | "md" | "lg" | number;
  maxSizeInMB?: number;
}

/**
 * A specialized field renderer for avatar/profile pictures
 */
export function AvatarRenderer({
  value,
  onChange,
  disabled = false,
  name = "",
  size = "md",
  maxSizeInMB = 2,
}: AvatarRendererProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Convert size to pixels
  const sizeInPx = typeof size === "number" 
    ? size 
    : size === "sm" 
      ? 40 
      : size === "md" 
        ? 64 
        : 96; // lg
  
  // Generate initials from name
  const getInitials = (name: string): string => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
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
  
  // Handle removing the avatar
  const handleRemoveAvatar = () => {
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
    <div className="flex flex-col items-center gap-3">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        disabled={disabled}
        className="hidden"
      />
      
      {/* Avatar display */}
      <div className="relative">
        <Avatar style={{ width: sizeInPx, height: sizeInPx }}>
          <AvatarImage src={value || undefined} alt={name || "Avatar"} />
          <AvatarFallback className="text-lg">{getInitials(name)}</AvatarFallback>
        </Avatar>
        
        {/* Remove button - only show if there's an avatar and not disabled */}
        {value && !disabled && (
          <button
            type="button"
            onClick={handleRemoveAvatar}
            className="absolute -top-2 -right-2 p-1 bg-background rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors shadow-sm"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      
      {/* Upload/change button */}
      {!disabled && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUploadClick}
          className="gap-1"
        >
          <Upload className="h-3 w-3" />
          {value ? "Change" : "Upload"}
        </Button>
      )}
    </div>
  );
} 