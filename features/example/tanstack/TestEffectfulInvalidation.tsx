"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useTestQuery, useEffectfulInvalidation, useDirectInvalidation } from "./hooks";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function TestEffectfulInvalidation() {
    const { data, isLoading, refetch, status, fetchStatus } = useTestQuery();
    const invalidateMutation = useEffectfulInvalidation();
    const directInvalidation = useDirectInvalidation();
    const [isInvalidating, setIsInvalidating] = useState(false);
    const [isDirectInvalidating, setIsDirectInvalidating] = useState(false);
    const queryClient = useQueryClient();
    
    // Log query cache state on mount and after data changes
    useEffect(() => {
      console.log("Effect test - Query status:", status, "Fetch status:", fetchStatus);
    }, [status, fetchStatus, data]);
    
    const handleInvalidate = async () => {
      setIsInvalidating(true);
      console.log("Effect test - Starting invalidation process");
      
      try {
        // The mutation returns a Promise<{ success: boolean }>
        const result = await invalidateMutation.mutateAsync(undefined);
        
        console.log("Effect test - Invalidation result:", result);
        
        if (result && typeof result === 'object' && 'success' in result) {
          toast.success("Effectful invalidation succeeded");
        } else {
          toast.error("Effectful invalidation failed");
        }
      } catch (error: any) {
        console.error("Effect test - Error in invalidation:", error);
        toast.error(`Effectful invalidation error: ${error?.message || String(error)}`);
      } finally {
        setIsInvalidating(false);
        console.log("Effect test - Invalidation process complete");
      }
    };
    
    const handleDirectInvalidate = async () => {
      setIsDirectInvalidating(true);
      console.log("Effect test - Starting direct invalidation");
      
      try {
        const result = await directInvalidation.invalidate();
        
        console.log("Effect test - Direct invalidation result:", result);
        
        if (result.success) {
          toast.success("Direct invalidation succeeded");
        } else {
          toast.error("Direct invalidation failed");
        }
      } catch (error: any) {
        console.error("Direct invalidation error:", error);
        toast.error(`Direct invalidation error: ${error?.message || String(error)}`);
      } finally {
        setIsDirectInvalidating(false);
      }
    };
    
  return (
    <Card className="border-green-500">
      <CardHeader className="bg-green-50">
        <CardTitle>Effect Framework</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2">Using simplified factory key approach</p>
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
            disabled={isInvalidating || invalidateMutation.isPending}
            variant="outline"
            className="border-green-500"
            size="sm"
          >
            {isInvalidating || invalidateMutation.isPending ? "Invalidating..." : "Effect Invalidate"}
          </Button>
          
          <Button 
            onClick={handleDirectInvalidate}
            disabled={isDirectInvalidating}
            variant="outline" 
            className="border-red-500"
            size="sm"
          >
            {isDirectInvalidating ? "Invalidating..." : "Force Refetch All"}
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