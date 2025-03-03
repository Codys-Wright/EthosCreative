"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// Type for the date renderer props
interface DateRendererProps {
  value: Date | string | null;
  onChange: (value: Date | null) => void;
  disabled?: boolean;
  placeholder?: string;
  showTime?: boolean; // Whether to include time input (not implemented yet)
  format?: string; // Date format string
  minDate?: Date; // Minimum selectable date
  maxDate?: Date; // Maximum selectable date
}

/**
 * A specialized field renderer for date input with calendar
 */
export function DateRenderer({
  value,
  onChange,
  disabled = false,
  placeholder = "Select date",
  showTime = false,
  format: formatString = "PPP", // Format from date-fns (e.g., 'Apr 29, 2023')
  minDate,
  maxDate,
}: DateRendererProps) {
  // Convert string date to Date object
  const dateValue = value 
    ? (typeof value === 'string' ? new Date(value) : value)
    : null;
  
  // Handle date selection
  const handleSelect = (date: Date | undefined) => {
    onChange(date || null);
  };
  
  // Handle clear button click
  const handleClear = () => {
    onChange(null);
  };
  
  return (
    <div className="w-full">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-11 py-2 leading-relaxed",
              !dateValue && "text-muted-foreground",
              disabled && "bg-muted cursor-not-allowed opacity-70"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateValue ? (
              format(dateValue, formatString)
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateValue || undefined}
            onSelect={handleSelect}
            disabled={disabled || ((date) => {
              // Apply min/max date constraints if provided
              if (minDate && date < minDate) return true;
              if (maxDate && date > maxDate) return true;
              return false;
            })}
            initialFocus
          />
          {dateValue && (
            <div className="p-3 border-t border-border">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClear}
                className="w-full"
              >
                Clear
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
} 