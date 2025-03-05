"use client";

import * as React from "react";
import { Tags } from "@/components/ui/tags";

// Type for the tags field renderer props
interface TagsRendererProps {
  value: string[] | null;
  onChange: (value: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  suggestions?: Array<{ id: string; label: string }>; // Optional list of tag suggestions
  customPlaceholder?: string;
}

/**
 * A specialized field renderer for tags input using the Tags component
 */
export function TagsRenderer({
  value = [],
  onChange,
  disabled = false,
  placeholder = "Add tags...",
  suggestions = [],
  customPlaceholder,
}: TagsRendererProps) {
  // Initialize default suggestions if none provided
  const defaultSuggestions = React.useMemo(() => [
    { id: "important", label: "Important" },
    { id: "urgent", label: "Urgent" },
    { id: "feature", label: "Feature" },
    { id: "bug", label: "Bug" },
    { id: "documentation", label: "Documentation" },
    { id: "enhancement", label: "Enhancement" },
    { id: "question", label: "Question" },
    { id: "help", label: "Help Wanted" },
  ], []);

  // Use provided suggestions or default ones
  const tagSuggestions = suggestions.length > 0 ? suggestions : defaultSuggestions;

  return (
    <Tags
      value={value || []}
      onChange={onChange}
      disabled={disabled}
      placeholder={customPlaceholder || placeholder}
      suggestions={tagSuggestions}
      className="w-full"
    />
  );
} 