import React from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { NewExampleType } from "@/features/example/types/example.type";
import { ExampleHooks } from "@/features/example/api/example.hooks";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/features/global/lib/utils/tanstack-query";

export default function ExampleCreationTest() {
  const createMutation = ExampleHooks.useCreate();
  
  const handleCreateClick = () => {
    // Create a valid example with only the needed fields
    const newExample: NewExampleType = {
      title: "Test Example",
      subtitle: "Created with proper fields",
      content: "This example demonstrates creating an item with only the needed fields."
    };
    
    // Log to show we're only using valid fields
    console.log("Creating example with fields:", Object.keys(newExample));
    
    // Call the create mutation
    createMutation.mutate(newExample, {
      onSuccess: (data) => {
        toast.success("Example created successfully!");
        console.log("Created example:", data);
      },
      onError: (error) => {
        toast.error("Failed to create example");
        console.error("Creation error:", error);
      }
    });
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Example Creation Test</h1>
        <p className="mb-4">
          This test demonstrates creating an example with only the required fields,
          without including auto-generated fields like id, createdAt, etc.
        </p>
        
        <Button onClick={handleCreateClick} className="mt-4">
          Create Test Example
        </Button>
        
        {createMutation.isPending && (
          <p className="mt-4 text-amber-500">Creating example...</p>
        )}
        
        {createMutation.isSuccess && (
          <div className="mt-4 p-4 border rounded-md bg-green-50">
            <p className="text-green-700 font-medium">Example created successfully!</p>
            <pre className="mt-2 p-2 bg-slate-100 rounded text-xs overflow-auto">
              {JSON.stringify(createMutation.data, null, 2)}
            </pre>
          </div>
        )}
        
        {createMutation.isError && (
          <div className="mt-4 p-4 border rounded-md bg-red-50">
            <p className="text-red-700 font-medium">Failed to create example</p>
            <pre className="mt-2 p-2 bg-slate-100 rounded text-xs overflow-auto">
              {JSON.stringify(createMutation.error, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </QueryClientProvider>
  );
} 