"use client";

import React, { useState, KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TagsInputProps {
  value: string[]; // Array of tag values
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  maxTags?: number;
  className?: string;
  allowDuplicates?: boolean;
}

export function TagsInput({
  value = [],
  onChange,
  placeholder = "Add tags...",
  disabled = false,
  readOnly = false,
  maxTags,
  className,
  allowDuplicates = false,
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (!trimmedTag) return;
    
    // Check if we've hit the max tags limit
    if (maxTags !== undefined && value.length >= maxTags) return;
    
    // Check for duplicates if not allowed
    if (!allowDuplicates && value.includes(trimmedTag)) return;
    
    const newTags = [...value, trimmedTag];
    onChange(newTags);
    setInputValue("");
  };

  const removeTag = (index: number) => {
    if (readOnly) return;
    const newTags = value.filter((_, i) => i !== index);
    onChange(newTags);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (readOnly) return;
    
    // Add tag on Enter or comma
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    }
    
    // Remove last tag on Backspace if input is empty
    if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  return (
    <div className={`flex flex-wrap gap-2 p-2 border rounded-md ${disabled ? 'opacity-50' : ''} ${className}`}>
      {/* Display existing tags */}
      {value.map((tag, index) => (
        <Badge key={`${tag}-${index}`} variant="secondary" className="flex items-center gap-1">
          {tag}
          {!readOnly && (
            <X
              size={14}
              className="cursor-pointer hover:text-destructive"
              onClick={() => removeTag(index)}
            />
          )}
        </Badge>
      ))}
      
      {/* Input for new tags */}
      {(!maxTags || value.length < maxTags) && !readOnly && (
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => inputValue && addTag(inputValue)}
          placeholder={value.length > 0 ? "" : placeholder}
          disabled={disabled}
          className="flex-grow border-0 p-0 h-8 min-w-[80px] focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      )}
    </div>
  );
} 