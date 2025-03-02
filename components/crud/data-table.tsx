"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Check, ChevronDown, Copy, Edit, MoreHorizontal, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { effectTsResolver } from "@hookform/resolvers/effect-ts";
import { Schema } from "effect";
import type { FieldPath, Path, PathValue, DefaultValues } from "react-hook-form";
import { FieldCustomization, FieldCustomizationRecord, GeneratedFieldType } from "./field-types";
import { DataEditorDialog, TabDefinition } from "./data-editor-dialog";
import { format } from "date-fns";

/**
 * Helper function to safely type a Schema for use with DataTable and form components
 * This allows passing an Effect schema while preserving TypeScript type information
 */
export function schemaFor<T>(schema: any): ReturnType<typeof Schema.make<T>> {
  return schema as unknown as ReturnType<typeof Schema.make<T>>;
}

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarIcon } from "lucide-react";

// Type for data cell renderers
export type CellRenderer<T> = (props: { value: any; row: T; field: string }) => React.ReactNode;

// Define standard renderer types that can be used with the DataTable
export enum RendererType {
  STRING = "string",
  STATUS = "status",
  ROLE = "role", 
  DATE = "date",
  BOOLEAN = "boolean",
  IMAGE = "image",
  AVATAR = "avatar",
  ID = "id"
}

// Define data type for column configuration with defaults
export type DataTableColumnConfig<T> = {
  field: string;
  header: string;
  sortable?: boolean; // Defaults to true
  searchable?: boolean; // Defaults to true
  hidden?: boolean; // Defaults to false
  width?: number; // Width in pixels
  maxTextWidth?: number; // Maximum text width in pixels before truncation
  renderer?: CellRenderer<T>;
  rendererType?: RendererType; // Optional renderer type to use one of the standard renderers
  rendererOptions?: Record<string, any>; // Optional options to pass to the standard renderer
  align?: 'left' | 'center' | 'right'; // Defaults to 'left'
  customFilter?: (value: any, filterValue: string) => boolean;
};

// Define the ColumnMeta interface that reflects our column configuration
interface ColumnMeta<T> {
  align?: 'left' | 'center' | 'right';
}

// Add a helper function to apply defaults to column configs
export function applyColumnDefaults<T>(
  columns: DataTableColumnConfig<T>[]
): DataTableColumnConfig<T>[] {
  return columns.map(column => ({
    sortable: true,
    searchable: true,
    hidden: false,
    align: 'left' as const,
    ...column
  }));
}

// Generic type for models with an ID field (for editing purposes)
type WithId = { id: string | any };

// Define props for the DataTable component
export interface DataTableProps<T extends Record<string, any>> {
  data: T[]; // The data to display
  columns: DataTableColumnConfig<T>[]; // Column definitions
  title?: string; // Optional table title
  description?: string; // Optional table description
  idField?: keyof T; // Which field contains the unique identifier
  searchPlaceholder?: string; // Custom placeholder for search input
  
  // CRUD operation handlers
  onEdit: (row: T) => void; // Callback when edit is clicked
  onDelete: (row: T) => Promise<boolean> | boolean; // Callback when delete is clicked
  onCreateNew: () => void; // Callback when create new is clicked
  onFieldUpdate: (row: T, field: keyof T, value: any) => Promise<boolean> | boolean; // Callback for updating a single field
  
  // Row editor component (render prop) - THIS WILL BE DEPRECATED
  rowEditor?: (props: { 
    row: T; 
    open: boolean; 
    onOpenChange: (open: boolean) => void; 
    onSave: (updatedData: T) => void | Promise<void>;
  }) => React.ReactNode;
  
  // Create editor component (render prop) - THIS WILL BE DEPRECATED
  createEditor?: (props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (newData: any) => void | Promise<void>;
  }) => React.ReactNode;
  
  // Integrated editor properties (new)
  useIntegratedEditor?: boolean; // Whether to use the integrated editor instead of render props
  createSchema?: ReturnType<typeof Schema.make<any>>; // Schema for creating new items
  editSchema?: ReturnType<typeof Schema.make<T>>; // Schema for editing existing items
  tabs?: TabDefinition<T>[]; // Tab definitions (used for both create and edit modes)
  fieldCustomizations?: FieldCustomizationRecord<T>; // Field customizations for validation and UI
  editorKeyInfo?: {
    title: {
      field: string;
      label: string;
    };
    subtitle?: {
      field: string;
      label: string;
    };
    additionalFields?: {
      field: string;
      label: string;
    }[];
  }; // Key information for the editor dialog
  
  enableSelection?: boolean; // Enable row selection, defaults to true
  customActions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (row: T) => void;
    condition?: (row: T) => boolean; // Optional condition to show/hide this action
  }>;
  emptyStateMessage?: string; // Message to show when no data is available
  emptyStateDescription?: string; // Description to show when no data is available
  
  // Schema and editing configuration
  schema?: ReturnType<typeof Schema.make<T>>; // Effect schema for validation
  editableFields?: Array<keyof T & string>; // List of specific fields that can be edited inline
  uneditableFields?: Array<keyof T & string>; // List of fields that cannot be edited
  editable?: boolean; // Master switch to enable/disable editing (default is false)
}

// Helper to truncate ID for display
const truncateId = (id: string) => {
  if (!id) return "";
  if (id.length <= 8) return id;
  return `${id.substring(0, 4)}...${id.substring(id.length - 4)}`;
};

// Inline Field Editor for editing a single field with schema validation
type InlineFieldEditorProps<T extends Record<string, any>> = {
  row: T;
  field: keyof T & string;
  schema: ReturnType<typeof Schema.make<T>>;
  onUpdate: (value: any) => Promise<void>;
  onCancel: () => void;
  customization?: FieldCustomization;
};

const InlineFieldEditor = <T extends Record<string, any>>({
  row,
  field,
  schema,
  onUpdate,
  onCancel,
  customization,
}: InlineFieldEditorProps<T>) => {
  const [isPending, setIsPending] = React.useState(false);
  
  // Create refs for input elements to focus them programmatically
  const inputRef = React.useRef<HTMLInputElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  // Extract field schema and auto-detect field type if not specified
  const fieldType = customization?.type || getFieldTypeFromValue(row[field]);
  
  // Use React Hook Form with Effect schema validation
  const form = useForm<T>({
    resolver: effectTsResolver(schema),
    defaultValues: row as unknown as DefaultValues<T>, // Cast with proper type
  });
  
  // Focus the input and select all text when component mounts
  React.useEffect(() => {
    // Small timeout to ensure the popover is fully rendered
    const timeoutId = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      } else if (textareaRef.current) {
        textareaRef.current.focus();
        // We don't select all text in textareas by default as users may want to edit specific parts
      }
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, []);
  
  // Helper to detect field type from value
  function getFieldTypeFromValue(value: any): "text" | "textarea" | "number" | "email" | "date" | "select" | "checkbox" {
    if (value === null || value === undefined) return "text";
    
    if (typeof value === "number") return "number";
    if (typeof value === "boolean") return "checkbox";
    
    if (value instanceof Date || 
        (typeof value === "string" && !isNaN(Date.parse(value)) && value.includes('-'))) {
      return "date";
    }
    
    if (typeof value === "string") {
      if (value.includes("@") && value.includes(".")) return "email";
      if (value.length > 100) return "textarea";
    }
    
    return "text";
  }
  
  // Handle form submission
  const onSubmit = async (data: T) => {
    try {
      setIsPending(true);
      await onUpdate(data[field]);
      // Success is handled by hook actions
    } catch (error) {
      console.error(`Error updating ${String(field)}:`, error);
      // Error is handled by hook actions
    } finally {
      setIsPending(false);
    }
  };
  
  // Helper to safely get field value as string
  const getFieldValueAsString = (): string => {
    const value = form.getValues(field as Path<T>);
    if (value === null || value === undefined) return '';
    return String(value);
  };
  
  return (
    <div className="p-3 space-y-2 min-w-[240px] max-w-[320px]" onClick={(e) => e.stopPropagation()}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <div className="space-y-2">
          {customization?.label && (
            <label className="text-sm font-medium">{customization.label}</label>
          )}
          
          {fieldType === "text" && (
            <Input
              {...form.register(field as Path<T>)}
              placeholder={customization?.placeholder}
              disabled={isPending}
              autoFocus
              onFocus={(e) => e.target.select()}
              // Use callback ref pattern to get the input element
              ref={(e) => {
                // First register the input with react-hook-form
                const { ref } = form.register(field as Path<T>);
                if (typeof ref === 'function') ref(e);
                
                // Then set our local ref for focus management
                inputRef.current = e;
                
                // If the element exists, focus and select it
                if (e) {
                  e.focus();
                  e.select();
                }
              }}
              // Ensure the value is always set explicitly
              defaultValue={getFieldValueAsString()}
            />
          )}
          
          {fieldType === "textarea" && (
            <Textarea
              {...form.register(field as Path<T>)}
              placeholder={customization?.placeholder}
              disabled={isPending}
              autoFocus
              className="min-h-[80px]"
              // Use callback ref pattern
              ref={(e) => {
                const { ref } = form.register(field as Path<T>);
                if (typeof ref === 'function') ref(e);
                textareaRef.current = e;
                if (e) e.focus();
              }}
              defaultValue={getFieldValueAsString()}
            />
          )}
          
          {fieldType === "number" && (
            <Input
              {...form.register(field as Path<T>, { valueAsNumber: true })}
              type="number"
              placeholder={customization?.placeholder}
              disabled={isPending}
              autoFocus
              onFocus={(e) => e.target.select()}
              // Use callback ref pattern
              ref={(e) => {
                const { ref } = form.register(field as Path<T>, { valueAsNumber: true });
                if (typeof ref === 'function') ref(e);
                inputRef.current = e;
                if (e) {
                  e.focus();
                  e.select();
                }
              }}
              defaultValue={row[field] !== undefined ? row[field] : ''}
            />
          )}
          
          {fieldType === "email" && (
            <Input
              {...form.register(field as Path<T>)}
              type="email"
              placeholder={customization?.placeholder || "email@example.com"}
              disabled={isPending}
              autoFocus
              onFocus={(e) => e.target.select()}
              // Use callback ref pattern
              ref={(e) => {
                const { ref } = form.register(field as Path<T>);
                if (typeof ref === 'function') ref(e);
                inputRef.current = e;
                if (e) {
                  e.focus();
                  e.select();
                }
              }}
              defaultValue={getFieldValueAsString()}
            />
          )}
          
          {fieldType === "date" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !form.watch(field as Path<T>) && "text-muted-foreground"
                  )}
                  disabled={isPending}
                >
                  {form.watch(field as Path<T>) ? (
                    format(new Date(form.watch(field as Path<T>)), "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={form.watch(field as Path<T>) ? new Date(form.watch(field as Path<T>)) : undefined}
                  onSelect={(date) => form.setValue(field as Path<T>, date as PathValue<T, Path<T>>)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}
          
          {fieldType === "checkbox" && (
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={form.watch(field as Path<T>) as boolean}
                onCheckedChange={(checked) => 
                  form.setValue(field as Path<T>, checked as PathValue<T, Path<T>>)
                }
                disabled={isPending}
                id={`${field}-checkbox`}
              />
              <label
                htmlFor={`${field}-checkbox`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {customization?.label || field}
              </label>
            </div>
          )}
          
          {fieldType === "select" && customization?.options && (
            <select
              {...form.register(field as Path<T>)}
              disabled={isPending}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              defaultValue={getFieldValueAsString()}
            >
              {customization.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
          
          {customization?.description && (
            <p className="text-xs text-muted-foreground">{customization.description}</p>
          )}
          
          {form.formState.errors[field as string] && (
            <p className="text-xs text-destructive">
              {form.formState.errors[field as string]?.message as string}
            </p>
          )}
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </div>
  );
};

// ID display component with copy functionality
const IdDisplay = ({ id, showCopyButton = true }: { id: string; showCopyButton?: boolean }) => {
  const [copied, setCopied] = React.useState(false);
  
  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopied(true);
    toast.success("ID copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className="font-mono text-xs py-1"
            >
              ID
            </Badge>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[300px] break-all">
            <p className="text-xs font-mono">{id}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {showCopyButton && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 text-muted-foreground hover:text-foreground" 
                onClick={copyToClipboard}
              >
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">
              <p className="text-xs">{copied ? "Copied!" : "Copy ID"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

// Date Calendar Component for displaying dates with detailed view
export const DateCalendarCell = ({ date }: { date: string | Date | null | undefined }) => {
  if (!date) return <span className="text-muted-foreground">-</span>;
  
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    date ? new Date(date) : undefined
  );
  const [showTechnicalDetails, setShowTechnicalDetails] = React.useState(false);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "max-w-[180px] justify-center text-center font-normal",
            !date && "text-muted-foreground"
          )}
        >
          {selectedDate ? (
            <span>{format(selectedDate, "PPP")}</span>
          ) : (
            <span>No date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            initialFocus
            disabled={true} // Make it read-only
          />
          {selectedDate && (
            <div className="border-l min-w-[240px] bg-muted/50 flex flex-col h-[352px]">
              <div className="p-4 flex flex-col h-full">
                <h4 className="text-sm font-semibold mb-2 flex items-center">
                  {showTechnicalDetails ? "Technical Details" : "Date Information"}
                </h4>
                
                <ScrollArea className="flex-1 h-[260px]">
                  {!showTechnicalDetails ? (
                    <div className="rounded-md bg-background p-3 shadow-sm border">
                      <div className="text-xs font-medium text-muted-foreground mb-1">FORMATTED DATE</div>
                      <div className="text-sm font-medium mb-2">{format(selectedDate, "PPP")}</div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                        <div>
                          <div className="text-muted-foreground mb-1">DAY</div>
                          <div className="font-medium">{format(selectedDate, "EEEE")}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground mb-1">TIME</div>
                          <div className="font-medium">{format(selectedDate, "p")}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="rounded-md bg-background p-2 shadow-sm border">
                        <div className="text-xs text-muted-foreground">ISO 8601</div>
                        <div className="text-xs font-mono mt-1 font-medium break-all">{selectedDate.toISOString()}</div>
                      </div>
                      
                      <div className="rounded-md bg-background p-2 shadow-sm border">
                        <div className="text-xs text-muted-foreground">UTC STRING</div>
                        <div className="text-xs font-mono mt-1 font-medium break-all">{selectedDate.toUTCString()}</div>
                      </div>
                    </div>
                  )}
                </ScrollArea>
                
                <div className="mt-4 pt-2 border-t">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  >
                    {showTechnicalDetails ? "View Date Information" : "View Technical Details"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Image display cell
export const ImageCell = ({ src, alt, size = "md" }: { src: string | null; alt?: string; size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };
  
  if (!src) {
    return (
      <div className={`${sizeClasses[size]} bg-muted rounded-md flex items-center justify-center`}>
        <X className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <img 
      src={src} 
      alt={alt || "Image"} 
      className={`${sizeClasses[size]} object-cover rounded-md`}
      onError={(e) => {
        (e.target as HTMLImageElement).src = "https://placehold.co/400?text=Error";
      }}
    />
  );
};

// Profile picture cell with avatar
export const ProfilePictureCell = ({ src, name, size = "md" }: { src: string | null; name?: string; size?: "sm" | "md" | "lg" }) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base"
  };
  
  // Generate initials from name
  const getInitials = (name?: string): string => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  const hasImage = !!src;
  const initials = getInitials(name);
  
  if (!hasImage) {
    return (
      <div className={`${sizeClasses[size]} bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold`}>
        {initials}
      </div>
    );
  }
  
  return (
    <img 
      src={src} 
      alt={name || "Avatar"} 
      className={`${sizeClasses[size]} object-cover rounded-full`}
      onError={(e) => {
        // If image fails to load, show initials instead
        (e.target as HTMLElement).outerHTML = `
          <div class="${sizeClasses[size]} bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
            ${initials}
          </div>
        `;
      }}
    />
  );
};

// Standard renderers that can be reused across different tables
/////////////////////////////////////////////////////////////

// Status renderer with customizable colors based on value
export const StatusRenderer = ({ value, options }: { 
  value: string; 
  options?: {
    value: string;
    className?: string;
  }[]
}) => {
  // Default color mapping if no options provided
  const defaultClassNames = (value: string) => {
    switch(value) {
      case "active":
      case "approved":
      case "completed":
      case "success":
        return "bg-green-500/20 text-green-700 hover:bg-green-500/20 hover:text-green-700";
      case "inactive":
      case "disabled":
      case "cancelled":
        return "bg-gray-500/20 text-gray-700 hover:bg-gray-500/20 hover:text-gray-700";
      case "pending":
      case "processing":
      case "waiting":
        return "bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/20 hover:text-yellow-700";
      case "error":
      case "failed":
      case "rejected":
        return "bg-red-500/20 text-red-700 hover:bg-red-500/20 hover:text-red-700";
      default:
        return "bg-blue-500/20 text-blue-700 hover:bg-blue-500/20 hover:text-blue-700";
    }
  };

  // Find matching option or use default
  const option = options?.find(opt => opt.value === value);
  const className = option?.className || defaultClassNames(value);

  return (
    <Badge className={cn("text-xs", className)}>
      {value}
    </Badge>
  );
};

// Role renderer with appropriate styling for different roles
export const RoleRenderer = ({ value, options }: { 
  value: string; 
  options?: {
    value: string;
    className?: string;
  }[]
}) => {
  // Default color mapping if no options provided
  const defaultClassNames = (value: string) => {
    switch(value) {
      case "admin":
      case "administrator":
        return "border-blue-500 text-blue-700";
      case "user":
      case "customer":
        return "border-green-500 text-green-700";
      case "editor":
      case "contributor":
        return "border-purple-500 text-purple-700";
      case "moderator":
        return "border-orange-500 text-orange-700";
      default:
        return "border-gray-500 text-gray-700";
    }
  };

  // Find matching option or use default
  const option = options?.find(opt => opt.value === value);
  const className = option?.className || defaultClassNames(value);

  return (
    <Badge variant="outline" className={cn("text-xs", className)}>
      {value}
    </Badge>
  );
};

// Date renderer with formatting
export const DateRenderer = ({ 
  value, 
  formatString = "PPP" 
}: { 
  value: string | Date | null | undefined; 
  formatString?: string;
}) => {
  if (!value) return <span className="text-muted-foreground">—</span>;
  
  // Parse the date more robustly
  const parsedDate = React.useMemo(() => {
    try {
      if (value instanceof Date) return value;
      if (typeof value === 'string') {
        // Handle ISO format strings specifically
        return new Date(value);
      }
      return undefined;
    } catch (e) {
      console.error("Failed to parse date:", e);
      return undefined;
    }
  }, [value]);
  
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(parsedDate);
  const [currentMonth, setCurrentMonth] = React.useState<Date | undefined>(parsedDate);
  const [showTechnicalDetails, setShowTechnicalDetails] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Make sure selectedDate is updated if the value prop changes
  React.useEffect(() => {
    if (parsedDate && (!selectedDate || parsedDate.getTime() !== selectedDate.getTime())) {
      setSelectedDate(parsedDate);
      setCurrentMonth(parsedDate); // Keep current month in sync
    }
  }, [parsedDate, selectedDate]);
  
  // Make sure the month view stays fixed to the selectedDate's month when popover opens
  React.useEffect(() => {
    if (isOpen && selectedDate) {
      setCurrentMonth(selectedDate);
    }
  }, [isOpen, selectedDate]);
  
  try {
    if (!selectedDate) throw new Error("Invalid date");
    const formattedDate = format(selectedDate, formatString);
    
    // Create a calendar popup component
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formattedDate}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex">
            {isOpen && (
              <Calendar
                key={`calendar-${selectedDate?.toISOString()}-${isOpen}`} // Key includes open state too
                mode="single"
                selected={selectedDate}
                defaultMonth={selectedDate} // Set default month to the selected date
                month={currentMonth} // Explicitly control the visible month
                onMonthChange={setCurrentMonth} // Track any month changes (though disabled, for completeness)
                onSelect={() => {}} // Read-only
                initialFocus
                disabled={true} // Make it read-only
              />
            )}
            {selectedDate && (
              <div className="border-l min-w-[240px] bg-muted/50 flex flex-col h-[352px]">
                <div className="p-4 flex flex-col h-full">
                  <h4 className="text-sm font-semibold mb-2 flex items-center">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {showTechnicalDetails ? "Technical Details" : "Date Information"}
                  </h4>
                  
                  <ScrollArea className="flex-1 h-[260px]">
                    {!showTechnicalDetails ? (
                      <div className="rounded-md bg-background p-3 shadow-sm border">
                        <div className="text-xs font-medium text-muted-foreground mb-1">FORMATTED DATE</div>
                        <div className="text-sm font-medium mb-2">{format(selectedDate, "PPP")}</div>
                        
                        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                          <div>
                            <div className="text-muted-foreground mb-1">DAY</div>
                            <div className="font-medium">{format(selectedDate, "EEEE")}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground mb-1">TIME</div>
                            <div className="font-medium">{format(selectedDate, "p")}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="rounded-md bg-background p-2 shadow-sm border">
                          <div className="text-xs text-muted-foreground">ISO 8601</div>
                          <div className="text-xs font-mono mt-1 font-medium break-all">{selectedDate.toISOString()}</div>
                        </div>
                        
                        <div className="rounded-md bg-background p-2 shadow-sm border">
                          <div className="text-xs text-muted-foreground">UTC STRING</div>
                          <div className="text-xs font-mono mt-1 font-medium break-all">{selectedDate.toUTCString()}</div>
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                  
                  <div className="mt-4 pt-2 border-t">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                      onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                    >
                      {showTechnicalDetails ? "View Date Information" : "View Technical Details"}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  } catch (error) {
    console.error("Error formatting date:", error);
    return <span className="text-muted-foreground">Invalid date</span>;
  }
};

// Boolean renderer with yes/no badges
export const BooleanRenderer = ({ 
  value, 
  labels = { true: "Yes", false: "No" } 
}: { 
  value: boolean; 
  labels?: { true: string; false: string };
}) => {
  return (
    <Badge variant={value ? "default" : "outline"}>
      {value ? labels.true : labels.false}
    </Badge>
  );
};

// Image renderer for displaying images
export const ImageRenderer = ({ 
  src, 
  alt = "", 
  size = "md" 
}: { 
  src: string | null | undefined; 
  alt?: string; 
  size?: "sm" | "md" | "lg";
}) => {
  const sizeClass = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  if (!src) return <div className={cn(sizeClass[size], "bg-muted rounded-md")} />;

  return (
    <div className={cn(sizeClass[size], "overflow-hidden rounded-md")}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
};

// Avatar renderer for user profiles
export const AvatarRenderer = ({ 
  src, 
  name, 
  size = "md" 
}: { 
  src?: string | null; 
  name?: string; 
  size?: "sm" | "md" | "lg";
}) => {
  const sizeClass = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const getInitials = (name?: string): string => {
    if (!name) return "";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Avatar className={sizeClass[size]}>
      <AvatarImage src={src || undefined} alt={name} />
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
};

// Function to render cells based on renderer type
function renderByType(type: RendererType, value: any, row: any, options?: Record<string, any>) {
  switch (type) {
    case RendererType.STATUS:
      return <StatusRenderer value={value} options={options?.statusOptions} />;
    case RendererType.ROLE:
      return <RoleRenderer value={value} options={options?.roleOptions} />;
    case RendererType.DATE:
      return <DateRenderer value={value} formatString={options?.formatString} />;
    case RendererType.BOOLEAN:
      return <BooleanRenderer value={value} labels={options?.labels} />;
    case RendererType.IMAGE:
      return <ImageRenderer src={value} alt={options?.alt || ''} size={options?.size} />;
    case RendererType.AVATAR:
      return <AvatarRenderer src={value} name={options?.name || row?.name || ''} />;
    case RendererType.ID:
      return <IdDisplay id={String(value)} />;
    case RendererType.STRING:
    default:
      return <span className="truncate block">{String(value || '')}</span>;
  }
}

// Main DataTable component
export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  description,
  idField = "id" as keyof T,
  searchPlaceholder = "Search...",
  onEdit,
  onDelete,
  onCreateNew,
  onFieldUpdate,
  rowEditor,
  createEditor,
  useIntegratedEditor = false,
  createSchema,
  editSchema,
  tabs,
  fieldCustomizations,
  editorKeyInfo,
  enableSelection = true,
  customActions = [],
  emptyStateMessage = "No data found",
  emptyStateDescription = "Try adjusting your search or filters",
  schema,
  editableFields,
  uneditableFields,
  editable = false,
}: DataTableProps<T>) {
  // State for sorting, filtering, visibility, and selection
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [isPending, setIsPending] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState<{ open: boolean; row: T | null }>({ open: false, row: null });
  
  // State for row editor
  const [editingRow, setEditingRow] = React.useState<{ data: T; open: boolean } | null>(null);
  
  // State for create editor
  const [isCreateEditorOpen, setIsCreateEditorOpen] = React.useState(false);
  // State to store new empty object for creation
  const [createFormData, setCreateFormData] = React.useState<Partial<T>>({});
  
  // State for inline field editing
  const [editingCell, setEditingCell] = React.useState<{ rowId: string; field: string } | null>(null);
  
  // Helper function to detect dummy/empty functions
  const isDummyFunction = (fn: Function) => {
    const fnStr = fn.toString();
    return fnStr === (() => {}).toString() || fnStr === '() => {}' || fnStr === 'function() {}';
  };

  // Log warnings if any of the handler functions are dummy functions
  React.useEffect(() => {
    if (isDummyFunction(onEdit)) {
      console.log('DataTable warning: onEdit is a dummy function');
    }
    if (isDummyFunction(onDelete)) {
      console.log('DataTable warning: onDelete is a dummy function');
    }
    if (isDummyFunction(onCreateNew)) {
      console.log('DataTable warning: onCreateNew is a dummy function');
    }
    if (isDummyFunction(onFieldUpdate)) {
      console.log('DataTable warning: onFieldUpdate is a dummy function');
    }
  }, [onEdit, onDelete, onCreateNew, onFieldUpdate]);

  // Wrap the default click handler of the edit action
  const handleEditClick = (row: T) => {
    // Check if integrated editor is enabled
    if (useIntegratedEditor && editSchema && tabs) {
      setEditingRow({ data: row, open: true });
    } else if (rowEditor) {
      // If custom row editor is provided via render prop
      setEditingRow({ data: row, open: true });
    } else {
      // Fall back to the traditional callback
      onEdit(row);
    }
  };

  // Wrap the default click handler for the create button
  const handleCreateClick = () => {
    // Reset the create form data to an empty object each time
    setCreateFormData({});
    
    // Check if integrated editor is enabled
    if (useIntegratedEditor && createSchema && tabs) {
      setIsCreateEditorOpen(true);
    } else if (createEditor) {
      // If custom create editor is provided via render prop
      setIsCreateEditorOpen(true);
    } else {
      // Fall back to the traditional callback
      onCreateNew();
    }
  };

  // Get default key info for editor if not provided
  const defaultKeyInfo = React.useMemo(() => {
    const firstTextField = columns.find(col => 
      !col.hidden && typeof data[0]?.[col.field] === 'string' && 
      col.field !== idField.toString()
    )?.field;
    
    const secondTextField = columns.find(col => 
      !col.hidden && typeof data[0]?.[col.field] === 'string' && 
      col.field !== idField.toString() && 
      col.field !== firstTextField
    )?.field;
    
    return {
      title: {
        field: firstTextField || 'name',
        label: columns.find(col => col.field === firstTextField)?.header || 'Name'
      },
      subtitle: secondTextField ? {
        field: secondTextField,
        label: columns.find(col => col.field === secondTextField)?.header || 'Description'
      } : undefined,
      additionalFields: [{
        field: idField.toString(),
        label: columns.find(col => col.field === idField.toString())?.header || 'ID'
      }]
    };
  }, [columns, data, idField]);

  // The key info for the editor dialog
  const keyInfo = editorKeyInfo || defaultKeyInfo;
  
  // Handle open/close for the integrated editor dialog
  const handleIntegratedEditorOpenChange = (isOpen: boolean, mode: 'create' | 'edit') => {
    if (mode === 'edit') {
      if (editingRow) {
        setEditingRow({ ...editingRow, open: isOpen });
      }
    } else {
      // If we're closing the creation dialog, reset the create form data 
      if (!isOpen) {
        setCreateFormData({});
      }
      setIsCreateEditorOpen(isOpen);
    }
  };
  
  // Handle saving data from the integrated editor
  const handleIntegratedEditorSave = async (data: any, mode: 'create' | 'edit') => {
    try {
      if (mode === 'edit') {
        // For editing, we use the onEdit callback
        await onEdit(data);
        setEditingRow(null);
      } else {
        // For creation, we use the onCreateNew callback
        await onCreateNew();
        setIsCreateEditorOpen(false);
      }
      return true;
    } catch (error) {
      console.error(`Error ${mode === 'edit' ? 'editing' : 'creating'} data:`, error);
      return false;
    }
  };

  // When we render the dropdown menu actions
  const renderActions = React.useCallback(
    (row: T) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          
          {!isDummyFunction(onEdit) && (
            <DropdownMenuItem onClick={() => handleEditClick(row)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          )}
          
          {!isDummyFunction(onDelete) && (
            <DropdownMenuItem onClick={() => setConfirmDelete({ open: true, row })}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          
          {customActions.map((action, index) => {
            // Check if action should be displayed
            if (action.condition && !action.condition(row)) {
              return null;
            }
            
            return (
              <DropdownMenuItem
                key={`custom-action-${index}`}
                onClick={() => action.onClick(row)}
              >
                {action.icon && <div className="mr-2">{action.icon}</div>}
                {action.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    [onEdit, onDelete, customActions, handleEditClick]
  );

  // Render the row actions cell
  const getRowActions = React.useCallback(
    (row: T) => {
      const rowId = String(row[idField]);
      
      return (
        <div className="flex justify-end">
          {renderActions(row)}
        </div>
      );
    },
    [idField, renderActions]
  );

  // Process columns with default settings
  const processedColumns = React.useMemo(() => applyColumnDefaults(columns), [columns]);

  // Generate TanStack table columns from our config
  const tableColumns = React.useMemo(() => {
    const cols: ColumnDef<T>[] = [];
    
    // Selection column
    if (enableSelection) {
      cols.push({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 40, // Fixed width for checkbox column
      });
    }
    
    // Add columns from config
    processedColumns.forEach(col => {
      cols.push({
        accessorKey: col.field,
        header: ({ column }) => {
          if (!col.sortable) {
            return <div className="font-semibold">{col.header}</div>;
          }
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className={cn("whitespace-nowrap", col.align === 'center' && "justify-center", col.align === 'right' && "justify-end")}
            >
              {col.header}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row, getValue }) => {
          // Get cell value
          const value = getValue();
          const rowId = String(row.original[idField]);
          const field = col.field;
          const cellProps = { value, row: row.original, field };
          const isEditing = editingCell?.rowId === rowId && editingCell.field === field;
          
          // Determine if this field is editable (simpler logic to avoid linter errors)
          const isEditable = editable && schema && 
            !isDummyFunction(onFieldUpdate) && 
            field !== String(idField) && 
            (!uneditableFields?.includes(field as keyof T & string)) && 
            (!editableFields?.length || editableFields.includes(field as keyof T & string));
          
          // Create a cell component with potential popover for editing
          const CellContent = () => {
            // Check if the row is in an optimistic update state
            const isOptimistic = (row.original as any).__optimistic === true;
            
            // Use custom renderer if provided
            if (col.renderer) {
              return (
                <div 
                  className={cn(
                    col.align === 'center' && "text-center",
                    col.align === 'right' && "text-right",
                    isEditable && "cursor-pointer hover:bg-muted/50 rounded p-1 -m-1 transition-colors",
                    isEditing && "bg-muted/50",
                    isOptimistic && "text-muted-foreground opacity-70"
                  )}
                >
                  {col.renderer(cellProps)}
                </div>
              );
            }
            
            // Use standard renderer based on rendererType if specified
            if (col.rendererType) {
              return (
                <div 
                  className={cn(
                    col.align === 'center' && "text-center",
                    col.align === 'right' && "text-right",
                    isEditable && "cursor-pointer hover:bg-muted/50 rounded p-1 -m-1 transition-colors",
                    isEditing && "bg-muted/50",
                    isOptimistic && "text-muted-foreground opacity-70"
                  )}
                >
                  {renderByType(col.rendererType, value, row.original, col.rendererOptions)}
                </div>
              );
            }
            
            // Default handling based on value type
            if (typeof value === 'undefined' || value === null) {
              return (
                <div 
                  className={cn(
                    "text-muted-foreground",
                    isEditable && "cursor-pointer hover:bg-muted/50 rounded p-1 -m-1 transition-colors",
                    isEditing && "bg-muted/50"
                  )}
                >
                  -
                </div>
              );
            }
            
            if (col.field === String(idField)) {
              return <IdDisplay id={String(value)} />;
            }
            
            if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)) && value.includes('-'))) {
              return (
                <div 
                  className={cn(
                    isEditable && "cursor-pointer hover:bg-muted/50 rounded p-1 -m-1 transition-colors",
                    isEditing && "bg-muted/50",
                    isOptimistic && "text-muted-foreground opacity-70"
                  )}
                >
                  {format(new Date(value), "PPP")}
                </div>
              );
            }
            
            // Apply maxTextWidth if specified
            const maxWidth = col.maxTextWidth ? `${col.maxTextWidth}px` : '300px';
            
            return (
              <div 
                className={cn(
                  "truncate",
                  col.align === 'center' && "text-center",
                  col.align === 'right' && "text-right",
                  isEditable && "cursor-pointer hover:bg-muted/50 rounded p-1 -m-1 transition-colors",
                  isEditing && "bg-muted/50",
                  isOptimistic && "text-muted-foreground opacity-70"
                )}
                style={{ maxWidth }}
                title={String(value)} // Add title for tooltip on hover
              >
                {String(value)}
              </div>
            );
          };

          // If not editable or ID field, just return the cell content
          if (!isEditable || col.field === String(idField)) {
            return <CellContent />;
          }
          
          // Use Popover for editable fields
          return (
            <Popover open={isEditing} onOpenChange={(open) => {
              if (open) {
                setEditingCell({ rowId, field });
              } else {
                setEditingCell(null);
              }
            }}>
              <PopoverTrigger asChild>
                <div onClick={() => setEditingCell({ rowId, field })}>
                  <CellContent />
                </div>
              </PopoverTrigger>
              {isEditing && schema && onFieldUpdate && (
                <PopoverContent 
                  side="top" 
                  align="center" 
                  className="shadow-lg border-border"
                  onOpenAutoFocus={(e) => {
                    // Prevent default focus behavior to let our custom focus logic work
                    e.preventDefault();
                  }}
                  onInteractOutside={(e) => {
                    // Prevent closing when interacting with date picker or similar popups
                    const target = e.target as HTMLElement;
                    const isCalendar = target.closest('[role="dialog"]');
                    if (isCalendar) {
                      e.preventDefault();
                    }
                  }}
                >
                  <InlineFieldEditor
                    row={row.original}
                    field={field as keyof T & string}
                    schema={schema}
                    customization={fieldCustomizations?.[field as keyof T & string]}
                    onUpdate={async (newValue) => {
                      try {
                        setIsPending(true);
                        const success = await onFieldUpdate(row.original, field as keyof T, newValue);
                        // Success/error handling is done by hook actions
                      } catch (error) {
                        console.error("Error updating field:", error);
                        // Error is handled by hook actions
                      } finally {
                        setIsPending(false);
                        setEditingCell(null);
                      }
                    }}
                    onCancel={() => setEditingCell(null)}
                  />
                </PopoverContent>
              )}
            </Popover>
          );
        },
        enableSorting: col.sortable !== false,
        size: col.width || 200,
      });
    });
    
    // Actions column
    cols.push({
      id: "actions",
      cell: ({ row }) => getRowActions(row.original),
      enableSorting: false,
      enableHiding: false,
      size: 60,
    });
    
    return cols;
  }, [processedColumns, enableSelection, idField, onEdit, onDelete, onFieldUpdate, customActions, schema, editableFields, uneditableFields, editable, fieldCustomizations, getRowActions]);
  
  // Initialize table
  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    enableRowSelection: enableSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  // Render the create button if needed
  const renderCreateButton = () => {
    if (isDummyFunction(onCreateNew)) return null;
    
    return (
      <Button
        onClick={handleCreateClick}
        className="ml-auto gap-1"
      >
        <Plus className="h-4 w-4" /> New
      </Button>
    );
  };

  // Handle delete confirmation
  const handleConfirmDelete = async () => {
    if (!confirmDelete.row || !onDelete) return;
    
    try {
      setIsPending(true);
      const success = await onDelete(confirmDelete.row);
      // Success/error handling is done by hook actions
    } catch (error) {
      console.error("Error deleting:", error);
      // Error is handled by hook actions
    } finally {
      setIsPending(false);
      setConfirmDelete({ open: false, row: null });
    }
  };
  
  // Handle global search
  const handleGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlobalFilter(e.target.value);
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-md rounded-lg overflow-hidden border-border">
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        
        <CardContent>
          <div className="flex flex-col space-y-4">
            {/* Toolbar */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Input
                  placeholder={searchPlaceholder}
                  value={globalFilter ?? ""}
                  onChange={handleGlobalFilterChange}
                  className="w-[250px]"
                />
              </div>
              
              <div className="flex items-center gap-2">
                {renderCreateButton()}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="ml-auto gap-1"
                    >
                      Columns <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {table
                      .getAllColumns()
                      .filter((column) => column.getCanHide())
                      .map((column) => {
                        return (
                          <DropdownMenuCheckboxItem
                            key={column.id}
                            className="capitalize"
                            checked={column.getIsVisible()}
                            onCheckedChange={(value) =>
                              column.toggleVisibility(!!value)
                            }
                          >
                            {column.id === "select" 
                              ? "Select" 
                              : column.id === "actions" 
                                ? "Actions" 
                                : columns.find(c => c.field === column.id)?.header || column.id}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {/* Table */}
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead 
                            key={header.id} 
                            style={{ width: `${header.getSize()}px` }}
                            className={cn(
                              "py-3 px-4",
                              (header.column.columnDef.meta as ColumnMeta<T>)?.align === 'center' && "text-center",
                              (header.column.columnDef.meta as ColumnMeta<T>)?.align === 'right' && "text-right"
                            )}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => {
                      // Check if row is in optimistic update state
                      const isOptimistic = (row.original as any).__optimistic === true;
                      const optimisticClass = isOptimistic ? "relative after:absolute after:inset-0 after:bg-muted/10 after:pointer-events-none" : "";
                      
                      return (
                        <tr
                          key={row.id}
                          data-state={row.getIsSelected() && "selected"}
                          className={cn(
                            "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
                            optimisticClass
                          )}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell 
                              key={cell.id} 
                              style={{ width: `${cell.column.getSize()}px` }}
                              className={cn(
                                "py-3 px-4",
                                (cell.column.columnDef.meta as ColumnMeta<T>)?.align === 'center' && "text-center",
                                (cell.column.columnDef.meta as ColumnMeta<T>)?.align === 'right' && "text-right"
                              )}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </tr>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={tableColumns.length}
                        className="h-24 text-center"
                      >
                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                          <div className="rounded-full bg-muted p-3">
                            <Search className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground font-medium">{emptyStateMessage}</p>
                          <p className="text-sm text-muted-foreground">{emptyStateDescription}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="flex-1 text-sm text-muted-foreground">
                {enableSelection && (
                  <div>
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Row Editor */}
      {rowEditor && editingRow && rowEditor({
        row: editingRow.data,
        open: editingRow.open,
        onOpenChange: (open) => {
          if (!open) {
            setEditingRow(null);
          } else {
            setEditingRow({ ...editingRow, open });
          }
        },
        onSave: async (updatedData) => {
          try {
            setIsPending(true);
            // Update data using the updater function
            if (onFieldUpdate) {
              // We need to update all fields
              const updatedFields = Object.keys(updatedData).filter(
                key => key !== String(idField)
              );
              
              for (const field of updatedFields) {
                await onFieldUpdate(
                  editingRow.data, 
                  field as keyof T, 
                  updatedData[field as keyof T]
                );
              }
            }
            
            // Close the editor
            setEditingRow(null);
          } catch (error) {
            console.error("Error updating row:", error);
          } finally {
            setIsPending(false);
          }
        }
      })}
      
      {/* Create Editor */}
      {createEditor && createEditor({
        open: isCreateEditorOpen,
        onOpenChange: setIsCreateEditorOpen,
        onSave: async (newData) => {
          setIsCreateEditorOpen(false);
          // No need to do anything else here - the consumer should handle the actual saving
        }
      })}
      
      {/* Delete confirmation dialog */}
      <Dialog open={confirmDelete.open} onOpenChange={(open) => !isPending && setConfirmDelete({ open, row: open ? confirmDelete.row : null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDelete({ open: false, row: null })}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Integrated Editor Dialogs */}
      {useIntegratedEditor && editSchema && tabs && editingRow && (
        <DataEditorDialog
          title={`Edit ${title ? title.slice(0, -1) : 'Item'}`}
          description={`Edit the details of this ${title ? title.slice(0, -1).toLowerCase() : 'item'}.`}
          data={editingRow.data}
          onSave={(data) => handleIntegratedEditorSave(data, 'edit')}
          keyInfo={keyInfo as any}
          schema={editSchema}
          createSchema={createSchema}
          tabs={tabs}
          fieldCustomizations={fieldCustomizations}
          open={editingRow.open}
          onOpenChange={(open) => handleIntegratedEditorOpenChange(open, 'edit')}
          trigger={null}
          mode="edit"
        />
      )}

      {useIntegratedEditor && createSchema && tabs && (
        <DataEditorDialog
          title={`Create New ${title ? title.slice(0, -1) : 'Item'}`}
          description={`Create a new ${title ? title.slice(0, -1).toLowerCase() : 'item'} by filling out the form.`}
          data={createFormData as any}  // Use the empty object as starting data
          onSave={(data) => {
            // For creation, we need to save the data through the appropriate handler
            // The existing handleIntegratedEditorSave function doesn't properly save the data
            if (onEdit) {
              // Pass the data to the save handler
              onEdit(data);
            }
            // Close the creation dialog
            setIsCreateEditorOpen(false);
            // Reset form data
            setCreateFormData({});
          }}
          keyInfo={keyInfo as any}
          schema={createSchema} // Use createSchema for both schema props
          createSchema={createSchema}
          tabs={tabs}
          fieldCustomizations={fieldCustomizations}
          open={isCreateEditorOpen}
          onOpenChange={(open) => handleIntegratedEditorOpenChange(open, 'create')}
          trigger={null}
          mode="create"
        />
      )}
    </div>
  );
} 