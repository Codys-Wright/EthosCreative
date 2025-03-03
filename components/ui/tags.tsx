"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Tag component with animation
interface TagProps {
  text: string;
  onRemove: () => void;
}

const Tag = ({ text, onRemove }: TagProps) => {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 0.5,
      }}
      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap shadow-sm border border-primary/20 bg-primary/10 text-primary"
    >
      <span className="mr-1">{text}</span>
      <motion.div 
        whileHover={{ scale: 1.1 }} 
        whileTap={{ scale: 0.9 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      >
        <Button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove();
          }}
          className="h-4 w-4 ml-1 flex items-center justify-center p-0 rounded-full 
                   bg-transparent hover:bg-destructive/10 hover:text-destructive
                   transition-colors"
          aria-label="Remove tag"
        >
          <X className="w-3 h-3" />
        </Button>
      </motion.div>
    </motion.span>
  );
};

// Main Tags component
interface TagsProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange"
  > {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  suggestions?: Array<{ id: string; label: string }>;
  disabled?: boolean;
  limit?: number;
}

export function Tags({
  value = [],
  onChange,
  placeholder = "Type to add tags...",
  className,
  suggestions = [],
  disabled = false,
  limit,
  ...props
}: TagsProps) {
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  // Track if we should ignore the next auto-close
  const [ignoreNextClose, setIgnoreNextClose] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstClickRef = useRef(true);

  // Filter suggestions based on input value
  const filteredSuggestions = suggestions.filter(
    (suggestion) =>
      !value.includes(suggestion.id) &&
      (inputValue === "" ||
        suggestion.label.toLowerCase().includes(inputValue.toLowerCase())),
  );

  // Check if the input value matches any existing suggestion
  const matchingSuggestion = inputValue
    ? suggestions.find(
        (s) => s.label.toLowerCase() === inputValue.toLowerCase(),
      )
    : undefined;

  // Create a new tag from input value
  const createTagFromInput = () => {
    if (!inputValue.trim() || disabled || (limit && value.length >= limit)) return;
    
    // If there's a matching suggestion, use its ID
    if (matchingSuggestion) {
      addTag(matchingSuggestion.id);
      return;
    }
    
    // Auto-capitalize the first letter for new tags
    const capitalizedInput = inputValue.trim().charAt(0).toUpperCase() + inputValue.trim().slice(1);
    
    // Create a new tag with the capitalized input value as both ID and label
    const newTagId = capitalizedInput;
    addTag(newTagId);
  };

  // Add a tag
  const addTag = (tagId: string) => {
    if (limit && value.length >= limit) return;
    if (!value.includes(tagId)) {
      onChange([...value, tagId]);
      setInputValue("");
      // Keep focus on input after adding a tag
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  };

  // Remove a tag
  const removeTag = (tagId: string) => {
    onChange(value.filter((id) => id !== tagId));
  };

  // Handle key presses in the container input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !inputValue && value.length > 0) {
      // Remove the last tag when backspace is pressed in an empty input
      removeTag(value[value.length - 1]);
    } else if (e.key === "Enter" && inputValue.trim()) {
      // Add a new tag when Enter is pressed and there's input
      e.preventDefault();
      createTagFromInput();
    } else if (e.key === "Escape") {
      // Close the dropdown on Escape
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  // Handle popover open/close
  const handleOpenChange = (newOpen: boolean) => {
    console.log(
      "Popover onOpenChange called with:",
      newOpen,
      "ignoreNextClose:",
      ignoreNextClose,
    );

    if (!newOpen && ignoreNextClose) {
      // If we should ignore this close, set flag back to false but don't close
      console.log("Ignoring auto-close because ignoreNextClose is true");
      setIgnoreNextClose(false);
      return;
    }

    // Handle normal open/close
    setOpen(newOpen);
  };

  // Handle container click
  const handleContainerClick = (e: React.MouseEvent) => {
    console.log("Container clicked, isFirstClick:", isFirstClickRef.current);
    if (disabled) return;

    // If this is the first click, we need to prevent auto-close
    if (isFirstClickRef.current) {
      setIgnoreNextClose(true);
      isFirstClickRef.current = false;
    }

    // Force open the dropdown and focus the input
    setOpen(true);
    inputRef.current?.focus();
  };

  // Handle input focus
  const handleInputFocus = () => {
    // Always open on focus
    setOpen(true);
  };

  return (
    <div className={cn("relative w-full", className)}>
      <div
        ref={containerRef}
        className={cn(
          "flex flex-wrap gap-2 p-2 min-h-10 w-full rounded-lg",
          "bg-background border border-input",
          open && !disabled && "ring-2 ring-ring",
          disabled && "cursor-not-allowed opacity-50",
          "focus-within:outline-none transition-colors",
        )}
        onClick={handleContainerClick}
      >
        <AnimatePresence>
          {value.map((tagId) => {
            const tagLabel =
              suggestions.find((s) => s.id === tagId)?.label || tagId;
            return (
              <Tag
                key={tagId}
                text={tagLabel}
                onRemove={() => removeTag(tagId)}
              />
            );
          })}
        </AnimatePresence>

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          placeholder={value.length === 0 ? placeholder : ""}
          className={cn(
            "flex-1 bg-transparent px-1 py-1 outline-none placeholder:text-muted-foreground min-w-[120px]",
            disabled && "cursor-not-allowed",
          )}
          disabled={disabled || (limit ? value.length >= limit : false)}
          {...props}
        />
      </div>

      {open && !disabled && (
        <div className="absolute z-10 w-full top-full mt-1">
          <div className="bg-popover rounded-md border shadow-md">
            <Command>
              <CommandInput
                placeholder="Search tags..."
                value={inputValue}
                onValueChange={setInputValue}
                className="border-none focus:ring-0"
              />
              <CommandList className="max-h-[200px]">
                {inputValue && (
                  <CommandItem
                    onSelect={() => createTagFromInput()}
                    className="text-foreground hover:bg-primary/10 hover:text-primary"
                  >
                    <span className="font-medium text-primary mr-1">
                      Create Tag:
                    </span>
                    <span>"{inputValue}"</span>
                  </CommandItem>
                )}
                {filteredSuggestions.length === 0 && !inputValue ? (
                  <CommandEmpty>No matching tags found</CommandEmpty>
                ) : filteredSuggestions.length > 0 ? (
                  <CommandGroup
                    heading={
                      filteredSuggestions.length > 0 ? "Matching tags" : null
                    }
                  >
                    {filteredSuggestions.map((suggestion) => (
                      <CommandItem
                        key={suggestion.id}
                        onSelect={() => addTag(suggestion.id)}
                        value={suggestion.label}
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-primary shadow-sm mr-2" />
                        <span>{suggestion.label}</span>
                        <Check className="ml-auto h-4 w-4 opacity-0 group-data-[selected=true]:opacity-100" />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : null}
              </CommandList>
            </Command>
          </div>
        </div>
      )}
    </div>
  );
}
