"use client"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useTestWithFactoryKey, useInvalidateTestWithFactoryKey } from "./hooks";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function TestWithFactoryKey() {
    const { data, isLoading, refetch, status, fetchStatus } = useTestWithFactoryKey();
    const { invalidate, queryKey } = useInvalidateTestWithFactoryKey();
    const [isInvalidating, setIsInvalidating] = useState(false);
    const queryClient = useQueryClient();
    
    // Log query cache state on mount and after data changes
    useEffect(() => {
      console.log("Factory test - Query key:", queryKey);
      console.log("Factory test - Query cache:", queryClient.getQueryData(queryKey));
      console.log("Factory test - Query status:", status, "Fetch status:", fetchStatus);
    }, [queryClient, queryKey, status, fetchStatus, data]);
    
    const handleInvalidate = async () => {
      setIsInvalidating(true);
      console.log("Factory test - Starting invalidation process");
      
      try {
        // Log before invalidation
        console.log("Factory test - Current query data before invalidation:", 
          queryClient.getQueryData(queryKey));
        
        const result = await invalidate();
        
        // Log after invalidation
        console.log("Factory test - Invalidation result:", result);
        console.log("Factory test - Query data after invalidation:", 
          queryClient.getQueryData(queryKey));
        
        if (result.success) {
          toast.success("Factory key: Successfully invalidated queries");
        } else {
          toast.error("Factory key: Failed to invalidate queries");
        }
      } catch (error) {
        console.error("Factory key: Error in invalidation:", error);
        toast.error("Factory key: An unexpected error occurred");
      } finally {
        setIsInvalidating(false);
        console.log("Factory key: Invalidation process complete");
      }
    };
    
  return (
    <Card className="border-yellow-500">
      <CardHeader className="bg-yellow-50">
        <CardTitle>Factory Key Approach</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2">Using createQueryKey function</p>
        <p>Status: {status} (Fetch: {fetchStatus})</p>
        {isLoading ? (
          <p>Loading...</p>
        ) : data?.length ? (
          <div className="mt-2 border-t pt-2">
            <p className="font-semibold">Data ({data.length} items):</p>
            {data.map((item) => (
              <p key={item.id} className="ml-2 truncate">• {item.title || item.id}</p>
            )).slice(0, 3)}
            {data.length > 3 && <p className="ml-2 text-sm text-muted-foreground">+ {data.length - 3} more items</p>}
          </div>
        ) : (
          <p>No data available</p>
        )}
      </CardContent>
      <CardFooter>
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={handleInvalidate} 
            disabled={isInvalidating}
            variant="outline"
            className="border-yellow-500"
            size="sm"
          >
            {isInvalidating ? "Invalidating..." : "Factory Invalidate"}
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