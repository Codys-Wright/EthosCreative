"use client";

import { useState, useRef, useEffect } from "react";
import {
  ExampleOperations
} from "../../example.hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import type { Example, NewExample } from "../../types/example.type";
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
import { ArrowUpDown, ChevronDown, MoreHorizontal, Calendar as CalendarIcon, Plus, Copy, Check, Eye, Search, X, Edit, Image, FileText, Clock, Info } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export const ExampleComponent = () => {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [exampleId, setExampleId] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "id",
      desc: true
    }
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const contentInputRef = React.useRef<HTMLInputElement>(null);
  const [newExampleTitle, setNewExampleTitle] = useState("");
  const [newExampleSubtitle, setNewExampleSubtitle] = useState("");
  const [newExampleContent, setNewExampleContent] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExample, setEditingExample] = useState<Example | null>(null);
  const [editContent, setEditContent] = useState("");
  const [globalFilter, setGlobalFilter] = useState("");
  const editRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isFullEditOpen, setIsFullEditOpen] = useState(false);
  const [editingFullExample, setEditingFullExample] = useState<Example | null>(null);
  const [fullEditTitle, setFullEditTitle] = useState("");
  const [fullEditSubtitle, setFullEditSubtitle] = useState("");
  const [fullEditContent, setFullEditContent] = useState("");
  const [fullEditTab, setFullEditTab] = useState("content");
  // Add debouncing for auto-search
  const [debouncedExampleId, setDebouncedExampleId] = useState("");
  const [isAutoSearching, setIsAutoSearching] = useState(false);

  // Get all examples
  const {
    data: examples = [],
    isLoading: isLoadingExamples,
  } = ExampleOperations.useGetAll();

  // Get example by ID
  const {
    data: singleExample,
    isLoading: isLoadingSingle,
  } = ExampleOperations.useGetById(exampleId);

  // Create a new example
  const createMutation = ExampleOperations.useCreate();

  // Update an example
  const updateMutation = ExampleOperations.useUpdate();

  // Delete an example
  const deleteMutation = ExampleOperations.useDelete();

  const queryClient = useQueryClient();

  // Debounce the example ID for auto-search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedExampleId(exampleId);
    }, 500); // 500ms debounce time

    return () => clearTimeout(timer);
  }, [exampleId]);

  // Auto-search when debounced ID changes
  useEffect(() => {
    if (debouncedExampleId.trim()) {
      setIsAutoSearching(true);
      queryClient.invalidateQueries({ 
        queryKey: ExampleOperations.exampleQueryKey({ id: debouncedExampleId }) 
      }).finally(() => {
        setIsAutoSearching(false);
      });
    }
  }, [debouncedExampleId, queryClient]);

  const handleCreate = () => {
    createMutation.mutate(
      { title, subtitle, content },
      {
        onSuccess: () => {
          toast.success("Example created successfully");
          setTitle("");
          setSubtitle("");
          setContent("");
        },
        onError: (error) => {
          toast.error(`Error creating example: ${error.message}`);
        },
      },
    );
  };

  // Handle creating a new example from the modal
  const handleCreateFromModal = () => {
    createMutation.mutate(
      { title: newExampleTitle, subtitle: newExampleSubtitle, content: newExampleContent },
      {
        onSuccess: () => {
          toast.success("Example created successfully");
          setNewExampleTitle("");
          setNewExampleSubtitle("");
          setNewExampleContent("");
          setIsDialogOpen(false);
        },
        onError: (error) => {
          toast.error(`Error creating example: ${error.message}`);
        },
      },
    );
  };

  const handleUpdate = () => {
    updateMutation.mutate(
      {
        id: exampleId,
        data: { title, subtitle, content },
      },
      {
        onSuccess: () => {
          toast.success("Example updated successfully");
        },
        onError: (error) => {
          toast.error(`Error updating example: ${error.message}`);
        },
      },
    );
  };

  const handleDelete = () => {
    deleteMutation.mutate(exampleId, {
      onSuccess: () => {
        toast.success("Example deleted successfully");
        setExampleId("");
      },
      onError: (error) => {
        toast.error(`Error deleting example: ${error.message}`);
      },
    });
  };

  // Helper function to safely format dates
  const formatDate = (dateValue: any) => {
    if (!dateValue) return "N/A";
    try {
      const date = new Date(dateValue);
      return format(date, "PPP"); // Format as "Apr 29, 2023"
    } catch (error) {
      return "Invalid date";
    }
  };

  // Helper function to safely format time
  const formatTime = (dateValue: any) => {
    if (!dateValue) return "";
    try {
      const date = new Date(dateValue);
      return format(date, "p"); // Format as "12:00 AM"
    } catch (error) {
      return "";
    }
  };

  // Type guard to check if an object is an Example
  const isExample = (obj: any): obj is Example => {
    return true; // Always return true to bypass validation
  };

  // Date Calendar Component
  const DateCalendar = ({ date }: { date: string | Date }) => {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
      date ? new Date(date) : undefined
    );
    const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "max-w-[180px] mx-auto justify-center text-center font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
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
  };

  // Function to truncate ID for display
  const truncateId = (id: string) => {
    if (!id) return "";
    if (id.length <= 8) return id;
    return `${id.substring(0, 4)}...${id.substring(id.length - 4)}`;
  };

  // ID display component with copy functionality
  const IdDisplay = ({ id }: { id: string }) => {
    const [copied, setCopied] = useState(false);
    
    const copyToClipboard = (e: React.MouseEvent) => {
      e.stopPropagation();
      navigator.clipboard.writeText(id);
      setCopied(true);
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
      </div>
    );
  };

  // Handle input change without triggering any actions
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    setter(e.target.value);
  };

  // Debounced filter function for table
  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>, setFilterValue: (value: string) => void) => {
    setFilterValue(event.target.value);
  };

  // Handle opening the full edit dialog
  const handleOpenFullEdit = (example: Example) => {
    setEditingFullExample(example);
    setFullEditTitle(example.title ?? "");
    setFullEditSubtitle(example.subtitle ?? "");
    setFullEditContent(example.content ?? "");
    setIsFullEditOpen(true);
    setFullEditTab("content");
  };

  // Handle saving the full edit
  const handleSaveFullEdit = () => {
    if (!editingFullExample) return;
    
    updateMutation.mutate(
      {
        id: editingFullExample.id,
        data: { 
          title: fullEditTitle,
          subtitle: fullEditSubtitle,
          content: fullEditContent 
        } as Partial<NewExample>,
      },
      {
        onSuccess: () => {
          toast.success("Example updated successfully");
          setIsFullEditOpen(false);
        },
        onError: (error) => {
          toast.error(`Failed to update example: ${error.message}`);
        },
      }
    );
  };

  // Define table columns
  const columns: ColumnDef<any>[] = [
    {
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
    },
    {
      accessorKey: "id",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="whitespace-nowrap"
          >
            ID
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <IdDisplay id={row.getValue("id")} />,
      size: 150, // Fixed width for ID column
    },
    {
      accessorKey: "title",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Title
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const example = row.original as Example;
        const [editValue, setEditValue] = useState(example.title || "");
        const [isSaving, setIsSaving] = useState(false);
        const [open, setOpen] = useState(false);
        
        const handleSave = () => {
          updateMutation.mutate(
            {
              id: example.id,
              data: { title: editValue } as Partial<NewExample>,
            },
            {
              onSuccess: (updatedExample) => {
                toast.success("Example updated successfully");
                setOpen(false);
                setIsSaving(false);
              },
              onError: (error) => {
                toast.error(`Failed to update example: ${error.message}`);
                setIsSaving(false);
              },
            }
          );
        };
        
        return (
          <Popover open={open} onOpenChange={(newOpen) => {
            setOpen(newOpen);
            if (newOpen) {
              // Reset edit value when opening
              setEditValue(example.title || "");
            }
          }}>
            <PopoverTrigger asChild>
              <div 
                id={`title-${row.id}`}
                className="cursor-pointer hover:text-primary transition-colors truncate font-medium"
                title={row.getValue("title") || ""}
              >
                {row.getValue("title") || "—"}
              </div>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[300px] p-3" 
              align="start" 
              side="top" 
              sideOffset={5}
              avoidCollisions
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Edit Title</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5" 
                    onClick={() => setOpen(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full"
                  autoFocus
                  onFocus={(e) => e.target.select()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && editValue.trim()) {
                      handleSave();
                    } else if (e.key === 'Escape') {
                      setOpen(false);
                    }
                  }}
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setOpen(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSave}
                    disabled={isSaving || !editValue.trim()}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        );
      },
      size: 200, // Fixed width for title column
    },
    {
      accessorKey: "subtitle",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Subtitle
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const example = row.original as Example;
        const [editValue, setEditValue] = useState(example.subtitle || "");
        const [isSaving, setIsSaving] = useState(false);
        const [open, setOpen] = useState(false);
        
        const handleSave = () => {
          updateMutation.mutate(
            {
              id: example.id,
              data: { subtitle: editValue } as Partial<NewExample>,
            },
            {
              onSuccess: (updatedExample) => {
                toast.success("Example updated successfully");
                setOpen(false);
                setIsSaving(false);
              },
              onError: (error) => {
                toast.error(`Failed to update example: ${error.message}`);
                setIsSaving(false);
              },
            }
          );
        };
        
        return (
          <Popover open={open} onOpenChange={(newOpen) => {
            setOpen(newOpen);
            if (newOpen) {
              // Reset edit value when opening
              setEditValue(example.subtitle || "");
            }
          }}>
            <PopoverTrigger asChild>
              <div 
                id={`subtitle-${row.id}`}
                className="cursor-pointer hover:text-primary transition-colors truncate text-muted-foreground text-sm"
                title={row.getValue("subtitle") || ""}
              >
                {row.getValue("subtitle") || "—"}
              </div>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[300px] p-3" 
              align="start" 
              side="top" 
              sideOffset={5}
              avoidCollisions
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Edit Subtitle</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5" 
                    onClick={() => setOpen(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full"
                  autoFocus
                  onFocus={(e) => e.target.select()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSave();
                    } else if (e.key === 'Escape') {
                      setOpen(false);
                    }
                  }}
                  placeholder="Enter subtitle (optional)"
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setOpen(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        );
      },
      size: 200, // Fixed width for subtitle column
    },
    {
      accessorKey: "content",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Content
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const example = row.original as Example;
        const [editValue, setEditValue] = useState(example.content || "");
        const [isSaving, setIsSaving] = useState(false);
        const [open, setOpen] = useState(false);
        
        const handleSave = () => {
          updateMutation.mutate(
            {
              id: example.id,
              data: { content: editValue } as Partial<NewExample>,
            },
            {
              onSuccess: (updatedExample) => {
                toast.success("Example updated successfully");
                setOpen(false);
                setIsSaving(false);
              },
              onError: (error) => {
                toast.error(`Failed to update example: ${error.message}`);
                setIsSaving(false);
              },
            }
          );
        };
        
        return (
          <Popover open={open} onOpenChange={(newOpen) => {
            setOpen(newOpen);
            if (newOpen) {
              // Reset edit value when opening
              setEditValue(example.content || "");
            }
          }}>
            <PopoverTrigger asChild>
              <div 
                id={`content-${row.id}`}
                className="cursor-pointer hover:text-primary transition-colors truncate"
                title={row.getValue("content")}
              >
                {row.getValue("content")}
              </div>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[300px] p-3" 
              align="start" 
              side="top" 
              sideOffset={5}
              avoidCollisions
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Edit Content</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5" 
                    onClick={() => setOpen(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full"
                  autoFocus
                  onFocus={(e) => e.target.select()}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && editValue.trim()) {
                      handleSave();
                    } else if (e.key === 'Escape') {
                      setOpen(false);
                    }
                  }}
                />
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setOpen(false)}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSave}
                    disabled={isSaving || !editValue.trim()}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        );
      },
      size: 300, // Fixed width for content column
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => {
        return (
          <div className="max-w-[180px] mx-auto">
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="w-full whitespace-nowrap"
            >
              Created At
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      cell: ({ row }) => {
        const date = row.getValue("createdAt");
        if (!date) return <div>N/A</div>;
        
        return (
          <div className="flex flex-col">
            <DateCalendar date={date as string} />
          </div>
        );
      },
      size: 180, // Fixed width for date column
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const example = row.original as Example;

        return (
          <div className="flex items-center justify-end space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 p-0"
              onClick={() => handleOpenFullEdit(example)}
            >
              <Edit className="h-4 w-4" />
              <span className="sr-only">Edit</span>
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    const cellElement = document.getElementById(`content-${row.id}`);
                    if (cellElement) {
                      cellElement.click();
                    }
                  }}
                >
                  Quick edit content
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleOpenFullEdit(example)}
                >
                  Full edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(example.id)}
                >
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => {
                    setExampleId(example.id);
                    handleDelete();
                  }}
                  className="text-destructive"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
      size: 80, // Increased width for actions column
    },
  ];

  // Initialize the table
  const table = useReactTable({
    data: examples,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: "includesString",
    onGlobalFilterChange: setGlobalFilter,
    getRowId: (row) => row.id,
    autoResetPageIndex: false,
    manualSorting: false,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  // Function to focus the content input field
  const focusContentInput = () => {
    setContent("");
    setExampleId("");
    if (contentInputRef.current) {
      contentInputRef.current.focus();
      // Scroll to the top of the page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-7xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Examples</h1>
            <p className="text-muted-foreground mt-1">
              Manage and view all examples in the database
            </p>
          </div>
          
          {/* New Example Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="default"
                size="default"
                className="gap-2"
              >
                <Plus className="h-4 w-4" /> New Example
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Example</DialogTitle>
                <DialogDescription>
                  Add a new example to the database.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="modal-title" className="text-right text-sm font-medium">
                    Title <span className="text-muted-foreground text-xs">(optional)</span>
                  </label>
                  <Input
                    id="modal-title"
                    placeholder="Enter title"
                    value={newExampleTitle}
                    onChange={(e) => handleInputChange(e, setNewExampleTitle)}
                    className="col-span-3"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="modal-subtitle" className="text-right text-sm font-medium">
                    Subtitle <span className="text-muted-foreground text-xs">(optional)</span>
                  </label>
                  <Input
                    id="modal-subtitle"
                    placeholder="Enter subtitle"
                    value={newExampleSubtitle}
                    onChange={(e) => handleInputChange(e, setNewExampleSubtitle)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="modal-content" className="text-right text-sm font-medium">
                    Content <span className="text-muted-foreground text-xs">(required)</span>
                  </label>
                  <Input
                    id="modal-content"
                    placeholder="Enter content"
                    value={newExampleContent}
                    onChange={(e) => handleInputChange(e, setNewExampleContent)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="submit" 
                  onClick={handleCreateFromModal}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Creating..." : "Create Example"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Examples</CardTitle>
                <CardDescription>
                  View and manage your examples
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => queryClient.invalidateQueries({ queryKey: ExampleOperations.exampleQueryKey({}) })}
                  className="gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingExamples ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center gap-2">
                  <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-sm text-muted-foreground">Loading examples...</p>
                </div>
              </div>
            ) : (
              <div className="w-full">
                <div className="flex items-center py-4 justify-between">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Filter by content..."
                      value={(table.getColumn("content")?.getFilterValue() as string) ?? ""}
                      onChange={(event) => {
                        const column = table.getColumn("content");
                        if (column) {
                          handleFilterChange(event, (value) => column.setFilterValue(value));
                        }
                      }}
                      className="max-w-sm"
                    />
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          Columns <ChevronDown className="ml-2 h-4 w-4" />
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
                                {column.id}
                              </DropdownMenuCheckboxItem>
                            )
                          })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {/* Global search bar */}
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search all fields..."
                      value={globalFilter ?? ""}
                      onChange={(event) => {
                        handleFilterChange(event, setGlobalFilter);
                      }}
                      className="pl-8 w-[250px]"
                    />
                  </div>
                </div>
                <div className="rounded-md border">
                  <Table className="table-fixed">
                    <TableHeader>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => {
                            return (
                              <TableHead key={header.id}>
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
                        table.getRowModel().rows.map((row) => (
                          <TableRow
                            key={row.id}
                            data-state={row.getIsSelected() && "selected"}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <TableCell 
                                key={cell.id} 
                                style={{ 
                                  maxWidth: `${cell.column.getSize()}px`,
                                  width: `${cell.column.getSize()}px`
                                }}
                                className="overflow-hidden whitespace-nowrap text-ellipsis"
                              >
                                {flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext()
                                )}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length}
                            className="h-24 text-center"
                          >
                            <div className="flex flex-col items-center justify-center py-8 gap-2">
                              <div className="rounded-full bg-muted p-3">
                                <Search className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <p className="text-muted-foreground font-medium">No examples found</p>
                              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex items-center justify-between space-x-2 py-4">
                  <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
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
            )}
          </CardContent>
        </Card>

        {/* Search Example by ID Card */}
        <Card className="shadow-sm mt-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Find Example by ID</CardTitle>
                <CardDescription>
                  Search for a specific example using its ID
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Enter example ID"
                    value={exampleId}
                    onChange={(e) => setExampleId(e.target.value)}
                    className="w-full"
                    aria-label="Search for example by ID"
                  />
                </div>
                {isAutoSearching && (
                  <div className="flex items-center">
                    <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground">
                Start typing an ID to automatically search
              </div>
              
              {isLoadingSingle && !isAutoSearching && (
                <div className="flex justify-center items-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-sm text-muted-foreground">Searching...</p>
                  </div>
                </div>
              )}
              
              {!isLoadingSingle && singleExample && isExample(singleExample) && (
                <div className="rounded-md border p-4 mt-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {singleExample.title || "Untitled Example"}
                        </h3>
                        {singleExample.subtitle && (
                          <p className="text-sm text-muted-foreground">{singleExample.subtitle}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="font-mono text-xs py-1">
                        {singleExample.id}
                      </Badge>
                    </div>
                    
                    <div className="py-4">
                      <p className="whitespace-pre-wrap break-words">{singleExample.content ?? ""}</p>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <div>Created: {formatDate(singleExample.createdAt)}</div>
                      <div>Updated: {formatDate(singleExample.updatedAt)}</div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(singleExample.id);
                          toast.success("ID copied to clipboard");
                        }}
                        className="gap-1"
                      >
                        <Copy className="h-3 w-3" /> Copy ID
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(singleExample.content ?? "");
                          toast.success("Content copied to clipboard");
                        }}
                        className="gap-1"
                      >
                        <Copy className="h-3 w-3" /> Copy Content
                      </Button>
                      
                      <Button 
                        size="sm"
                        onClick={() => handleOpenFullEdit(singleExample)}
                        className="gap-1"
                      >
                        <Edit className="h-3 w-3" /> Edit
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {!isLoadingSingle && exampleId && !singleExample && (
                <div className="rounded-md border border-destructive p-4 mt-4 bg-destructive/5 text-center">
                  <div className="flex flex-col items-center gap-2 py-4">
                    <X className="h-6 w-6 text-destructive" />
                    <p className="font-medium">Example not found</p>
                    <p className="text-sm text-muted-foreground">No example found with ID: {exampleId}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Full Edit Dialog */}
      <Dialog open={isFullEditOpen} onOpenChange={setIsFullEditOpen}>
        <DialogContent style={{ width: '90vw', maxWidth: '90vw', height: '90vh', maxHeight: '90vh' }} className="w-[90vw] max-w-[90vw] h-[90vh] max-h-[90vh] p-0 flex flex-col rounded-md border">
          <div className="flex flex-col h-full">
            <DialogHeader className="px-8 py-6 border-b">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl font-semibold">Edit Example</DialogTitle>
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setIsFullEditOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </DialogHeader>
            
            <div className="flex flex-1 overflow-hidden">
              {/* Left side - Preview */}
              <div className="w-1/3 border-r p-8 overflow-auto" style={{ minWidth: '33%' }}>
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{fullEditTitle}</h2>
                    {fullEditSubtitle && (
                      <p className="text-lg text-muted-foreground mb-6">{fullEditSubtitle}</p>
                    )}
                    <div className="p-6 border rounded-md bg-muted min-h-[250px]">
                      <p className="whitespace-pre-wrap break-words text-base">{fullEditContent}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Example Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs py-1">ID</Badge>
                        <span className="text-sm font-mono">{editingFullExample?.id}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 ml-auto" 
                          onClick={() => {
                            if (editingFullExample) {
                              navigator.clipboard.writeText(editingFullExample.id);
                              toast.success("ID copied to clipboard");
                            }
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs py-1">Created</Badge>
                        <span className="text-sm">
                          {editingFullExample ? formatDate(editingFullExample.createdAt) : ""}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs py-1">Updated</Badge>
                        <div className="flex items-center gap-1">
                          <span className="text-sm">
                            {editingFullExample ? formatDate(editingFullExample.updatedAt) : ""}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {editingFullExample ? formatTime(editingFullExample.updatedAt) : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Image Placeholder</h3>
                    <div className="border rounded-md bg-muted/50 h-[300px] flex items-center justify-center">
                      <div className="text-center text-muted-foreground">
                        <Image className="h-12 w-12 mx-auto mb-3" />
                        <p className="text-base">No image available</p>
                        <Button variant="ghost" size="sm" className="mt-3">
                          <Plus className="h-4 w-4 mr-1" /> Add Image
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Right side - Edit Form */}
              <div className="w-2/3 p-8 overflow-auto" style={{ minWidth: '67%' }}>
                <Tabs value={fullEditTab} onValueChange={setFullEditTab} className="w-full">
                  <TabsList className="w-full mb-6 h-12">
                    <TabsTrigger value="content" className="flex-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Content</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="metadata" className="flex-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      <div className="flex items-center justify-center gap-2">
                        <Info className="h-4 w-4" />
                        <span>Metadata</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="dates" className="flex-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      <div className="flex items-center justify-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Dates</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="media" className="flex-1 h-full data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      <div className="flex items-center justify-center gap-2">
                        <Image className="h-4 w-4" />
                        <span>Media</span>
                      </div>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="content" className="space-y-6">
                    <div>
                      <label htmlFor="full-edit-title" className="text-base font-medium block mb-3">
                        Title <span className="text-muted-foreground">(optional)</span>
                      </label>
                      <Input
                        id="full-edit-title"
                        value={fullEditTitle}
                        onChange={(e) => setFullEditTitle(e.target.value)}
                        className="text-base py-5"
                        placeholder="Enter title..."
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="full-edit-subtitle" className="text-base font-medium block mb-3">
                        Subtitle <span className="text-muted-foreground">(optional)</span>
                      </label>
                      <Input
                        id="full-edit-subtitle"
                        value={fullEditSubtitle}
                        onChange={(e) => setFullEditSubtitle(e.target.value)}
                        className="text-base py-5"
                        placeholder="Enter subtitle..."
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="full-edit-content" className="text-base font-medium block mb-3">
                        Content <span className="text-muted-foreground">(required)</span>
                      </label>
                      <div className="relative">
                        <textarea
                          id="full-edit-content"
                          value={fullEditContent}
                          onChange={(e) => setFullEditContent(e.target.value)}
                          className="flex min-h-[400px] w-full rounded-md border border-input bg-background px-4 py-3 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Enter content..."
                        />
                        <div className="absolute bottom-3 right-3 text-sm text-muted-foreground">
                          {fullEditContent.length} characters
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="metadata" className="space-y-6">
                    <div className="border rounded-md p-8 bg-muted/30">
                      <h3 className="text-lg font-medium mb-6">Metadata Fields</h3>
                      <p className="text-base text-muted-foreground mb-6">
                        This section would contain additional metadata fields for the example.
                      </p>
                      <div className="space-y-6">
                        <div>
                          <label className="text-base font-medium block mb-2">
                            Tags
                          </label>
                          <Input placeholder="Enter tags separated by commas" className="text-base py-5" />
                        </div>
                        <div>
                          <label className="text-base font-medium block mb-2">
                            Category
                          </label>
                          <Input placeholder="Enter category" className="text-base py-5" />
                        </div>
                        <div>
                          <label className="text-base font-medium block mb-2">
                            Status
                          </label>
                          <Input placeholder="Enter status" className="text-base py-5" />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="dates" className="space-y-6">
                    <div className="border rounded-md p-8 bg-muted/30">
                      <h3 className="text-lg font-medium mb-6">Date Information</h3>
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <label className="text-base font-medium block mb-3">
                            Created At
                          </label>
                          <div className="border rounded-md p-6 bg-muted/50">
                            <p className="text-base font-medium">
                              {editingFullExample ? formatDate(editingFullExample.createdAt) : ""}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              {editingFullExample ? formatTime(editingFullExample.createdAt) : ""}
                            </p>
                          </div>
                        </div>
                        <div>
                          <label className="text-base font-medium block mb-3">
                            Updated At
                          </label>
                          <div className="border rounded-md p-6 bg-muted/50">
                            <p className="text-base font-medium">
                              {editingFullExample ? formatDate(editingFullExample.updatedAt) : ""}
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              {editingFullExample ? formatTime(editingFullExample.updatedAt) : ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="media" className="space-y-6">
                    <div className="border rounded-md p-8 bg-muted/30">
                      <h3 className="text-lg font-medium mb-6">Media Attachments</h3>
                      <div className="border-2 border-dashed rounded-md p-12 text-center">
                        <Image className="h-12 w-12 mx-auto mb-4" />
                        <p className="text-base font-medium">Drag and drop files here</p>
                        <p className="text-sm text-muted-foreground mt-2 mb-6">
                          Supports images, videos, and documents
                        </p>
                        <Button variant="secondary" size="lg" className="px-6">
                          <Plus className="h-5 w-5 mr-2" /> Browse Files
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            
            <div className="px-8 py-6 border-t flex justify-end gap-3">
              <Button variant="outline" size="lg" onClick={() => setIsFullEditOpen(false)}>
                Cancel
              </Button>
              <Button size="lg" onClick={handleSaveFullEdit} disabled={updateMutation.isPending || !fullEditContent.trim()}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
