"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { createQueryKey, createQueryDataHelpers } from "@/features/global/lib/utils/query-data-helpers";
import { useEffectQuery } from "@/features/global/lib/utils/tanstack-query";
import { ExampleService } from "../example.service";
import { Example } from "../types/example.type";
import { Input } from "@/components/ui/input";

// Create a namespace with typed variables
type DemoVars = {
  filter?: string;
};

// Create a typed query key factory
const demoQueryKey = createQueryKey<"demo", DemoVars>("demo");

// Create the helper with our simplified approach
const demoHelper = createQueryDataHelpers<Example[], DemoVars>(demoQueryKey);

/**
 * Demo query hook using our factory approach
 */
export const useDemoQuery = (variables: DemoVars = {}) => {
  // Generate a fresh query key with variables
  const queryKey = demoQueryKey(variables);
  
  // Log the query key being used
  console.log("Demo query using key:", queryKey);
  
  return useEffectQuery({
    queryKey,
    queryFn: () => ExampleService.getAll(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Demo component showing the simplified query helpers in action
 */
export function QueryHelperDemo() {
  const [filter, setFilter] = useState("");
  const [isInvalidating, setIsInvalidating] = useState(false);
  const queryClient = useQueryClient();
  
  // Use our demo query
  const { 
    data, 
    isLoading, 
    status, 
    fetchStatus, 
    refetch 
  } = useDemoQuery({ filter: filter || undefined });
  
  // Log cache state when data changes
  useEffect(() => {
    console.log("Demo - Query status:", status, "Fetch status:", fetchStatus);
  }, [status, fetchStatus, data]);
  
  // Handle invalidation using our helper
  const handleInvalidate = () => {
    setIsInvalidating(true);
    console.log("Demo - Starting invalidation with filter:", filter);
    
    // Log before invalidation
    console.log("Demo - Before invalidation:", 
      queryClient.getQueryData(demoQueryKey({ filter: filter || undefined }))
    );
    
    // Use our helper to invalidate
    demoHelper.invalidateQuery({ filter: filter || undefined })
      .then(() => {
        console.log("Demo - After invalidation:", 
          queryClient.getQueryData(demoQueryKey({ filter: filter || undefined }))
        );
        toast.success("Query invalidated successfully");
      })
      .catch(error => {
        console.error("Demo - Error invalidating:", error);
        toast.error("Failed to invalidate query");
      })
      .finally(() => {
        setIsInvalidating(false);
      });
  };
  
  // Handle invalidating all queries in the namespace
  const handleInvalidateAll = () => {
    setIsInvalidating(true);
    console.log("Demo - Starting invalidation of all queries");
    
    demoHelper.invalidateAllQueries()
      .then(() => {
        toast.success("All demo queries invalidated");
      })
      .catch(error => {
        console.error("Demo - Error invalidating all:", error);
        toast.error("Failed to invalidate all queries");
      })
      .finally(() => {
        setIsInvalidating(false);
      });
  };
  
  return (
    <Card className="border-teal-500">
      <CardHeader className="bg-teal-50">
        <CardTitle>Simplified Query Helpers</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4">Using factory key approach with standard invalidation</p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Filter (optional):</label>
          <div className="flex gap-2">
            <Input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Enter filter"
            />
            <Button size="sm" onClick={() => refetch()}>Apply</Button>
          </div>
        </div>
        
        <div className="mb-2">
          <p>Status: {status} (Fetch: {fetchStatus})</p>
        </div>
        
        {isLoading ? (
          <p>Loading...</p>
        ) : data?.length ? (
          <div className="mt-2 border-t pt-2">
            <p className="font-semibold">Data ({data.length} items):</p>
            {data.slice(0, 3).map((item) => (
              <p key={item.id} className="ml-2 truncate">• {item.title || item.id}</p>
            ))}
            {data.length > 3 && <p className="ml-2 text-sm text-muted-foreground">+ {data.length - 3} more items</p>}
          </div>
        ) : (
          <p>No data available</p>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex gap-2">
          <Button 
            onClick={handleInvalidate} 
            disabled={isInvalidating}
            variant="outline"
            className="border-teal-500"
            size="sm"
          >
            {isInvalidating ? "Invalidating..." : "Invalidate Query"}
          </Button>
          
          <Button 
            onClick={handleInvalidateAll} 
            disabled={isInvalidating}
            variant="outline"
            className="border-teal-700"
            size="sm"
          >
            Invalidate All
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => refetch()} 
            disabled={isLoading}
            size="sm"
          >
            Refetch
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 