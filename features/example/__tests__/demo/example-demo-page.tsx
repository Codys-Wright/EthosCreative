"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/features/global/lib/utils/tanstack-query";
import { ExampleHooks } from "@/features/example/api/example.hooks";
import { ExampleType, NewExampleType } from "@/features/example/types/example.type";
import { DataTable } from "@/components/crud/data-table";
import {
  ExampleTableProps,
  exampleTableBaseProps,
  ExampleTableRuntimeProps,
} from "@/features/example/config/example-table.config";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExampleDemoPage() {
  // Track if component is mounted on client
  const [isMounted, setIsMounted] = useState(false);
  
  // Use the hooks for real data fetching and mutations
  const exampleQuery = ExampleHooks.useGetAll();
  const examples = (exampleQuery.data || []) as ExampleType[];
  const { isLoading, isError } = exampleQuery;
  const updateMutation = ExampleHooks.useUpdate();
  const createMutation = ExampleHooks.useCreate();
  const deleteMutation = ExampleHooks.useDelete();

  // Set isMounted to true after initial render to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // CRUD Handlers that use real API calls via the hooks

  // Handler for updating an example (from dialog editing)
  const updateExample = (updatedExample: ExampleType) => {
    if (!updatedExample.id) return false;
    
    // Get only the fields that can be updated (exclude id and timestamps)
    const { id, ...updateData } = updatedExample;
    
    // Trigger the update mutation
    updateMutation.mutate({ 
      id: id as string, 
      data: updateData 
    });
    
    return true;
  };

  // Field update handler for inline editing
  const handleFieldUpdate = async (row: ExampleType, field: keyof ExampleType, value: any): Promise<boolean> => {
    try {
      if (!row.id) return false;
      
      // Create an update object with just the changed field
      const updateData = { [field]: value };
      
      // Trigger the update mutation
      updateMutation.mutate({ 
        id: row.id as string, 
        data: updateData 
      });
      
      return true;
    } catch (error) {
      console.error("Error updating field:", error);
      return false;
    }
  };

  // Handler for saving an example (from dialog)
  const saveExample = (data: ExampleType | NewExampleType): void => {
    if ("id" in data && data.id) {
      // Update existing example
      const { id, ...updateData } = data;
      updateMutation.mutate({ id: id as string, data: updateData });
    } else {
      // Create new example - only pass fields from NewExampleType
      // Auto-generated fields like id, createdAt, etc. will be filtered by DataEditorDialog
      console.log("Creating new example with data:", data);
      createMutation.mutate(data as NewExampleType);
    }
  };

  // Handler for deleting an example
  const deleteExample = async (example: ExampleType) => {
    if (!example.id) return false;
    
    // Trigger the delete mutation
    deleteMutation.mutate(example.id as string);
    
    return true;
  };

  // Handler for initiating example creation
  const createExample = () => {
    // This is mostly handled by the DataTable's integrated editor
    // Ensure we're not in a stale state by resetting any necessary state
    console.log("Creating new example via dialog");
    
    // The DataTable component will now properly reset the form data
    // when opening the creation dialog due to our fix
  };

  // Define the runtime props that are specific to this instance
  const runtimeProps: ExampleTableRuntimeProps = {
    data: examples,
    onEdit: saveExample,
    onDelete: deleteExample,
    onCreateNew: createExample,
    onFieldUpdate: handleFieldUpdate,
    editable: true,
  };

  // Compose the complete props for this instance
  const tableProps = {
    ...exampleTableBaseProps,  // Use the base configuration
    ...runtimeProps,           // Override with runtime values
  } as ExampleTableProps;

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col items-center min-h-screen bg-background py-10">
        <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-8">
          <Card className="w-full shadow-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                Example Management Demo
              </CardTitle>
              <CardDescription className="max-w-3xl mx-auto">
                This demo showcases the Example feature with real API integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6 text-center max-w-3xl mx-auto">
                This implementation uses Tanstack Query hooks for data fetching and mutations. 
                All CRUD operations are handled through API calls with optimistic updates.
                Rows in an optimistic update state appear slightly grayed out until the server confirms the change.
              </p>
              <p className="text-sm text-muted-foreground mb-6 text-center max-w-3xl mx-auto">
                When creating a new example, only the required fields (title, subtitle, content) need to be provided.
                Auto-generated fields like ID and timestamps are handled by the backend.
                The dialog will show "Create" for new items and "Save Changes" when editing existing ones.
              </p>
            </CardContent>
          </Card>

          {/* Example management table */}
          <div className="w-full">
            {isMounted ? (
              isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : isError ? (
                <div className="flex justify-center p-8 text-red-500">
                  <p>Error loading examples. Please try again later.</p>
                </div>
              ) : (
                <DataTable {...tableProps} />
              )
            ) : (
              <div className="flex justify-center p-8">
                <p>Loading examples...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}
