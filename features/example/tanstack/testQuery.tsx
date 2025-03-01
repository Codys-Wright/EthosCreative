"use client"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useTestQuery, useInvalidateTestQuery, TEST_QUERY_KEY } from "./hooks";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { TestWithFactoryKey } from "./TestWithFactoryKey";
import { TestEffectfulInvalidation } from "./TestEffectfulInvalidation";
import { TestWithVars } from "./TestWithVars";
import { QueryHelperDemo } from "./QueryHelperDemo";
import { MinimalExample } from "./MinimalExample";

export function TestQuery() {
    const { data, isLoading, refetch, status, fetchStatus } = useTestQuery();
    const [manualLoading, setManualLoading] = useState(false);
    const queryClient = useQueryClient();
    // Get our custom invalidate hook
    const { invalidate } = useInvalidateTestQuery();
    
    // Log query cache state on mount and after data changes
    useEffect(() => {
      console.log("TestQuery - Query status:", status, "Fetch status:", fetchStatus);
      console.log("TestQuery - Query key:", TEST_QUERY_KEY);
      console.log("TestQuery - Current cache data for TEST_QUERY_KEY:", 
        queryClient.getQueryData(TEST_QUERY_KEY)
      );
    }, [status, fetchStatus, data, queryClient]);
    
    const handleInvalidate = async () => {
      setManualLoading(true);
      try {
        console.log("TestQuery - BEFORE invalidation, cache data:", 
          queryClient.getQueryData(TEST_QUERY_KEY)
        );
        
        // Use our custom hook to invalidate the query
        const result = await invalidate();
        
        console.log("TestQuery - AFTER invalidation, cache data:", 
          queryClient.getQueryData(TEST_QUERY_KEY)
        );
        
        if (result.success) {
          toast.success("Query invalidated successfully");
        } else {
          toast.error("Failed to invalidate query");
        }
      } catch (error) {
        console.error("TestQuery - Error invalidating:", error);
        toast.error("Failed to invalidate query");
      } finally {
        setManualLoading(false);
      }
    };
    
    const handleDirectInvalidate = () => {
      setManualLoading(true);
      try {
        console.log("TestQuery - BEFORE direct invalidation, cache data:", 
          queryClient.getQueryData(TEST_QUERY_KEY)
        );
        
        // Directly call queryClient.invalidateQueries
        queryClient.invalidateQueries({ queryKey: TEST_QUERY_KEY })
          .then(() => {
            console.log("TestQuery - AFTER direct invalidation, cache data:", 
              queryClient.getQueryData(TEST_QUERY_KEY)
            );
            toast.success("Direct invalidation successful");
            setManualLoading(false);
          })
          .catch(error => {
            console.error("TestQuery - Error in direct invalidation:", error);
            toast.error("Direct invalidation failed");
            setManualLoading(false);
          });
      } catch (error) {
        console.error("TestQuery - Error in direct invalidate:", error);
        toast.error("Error in direct invalidation");
        setManualLoading(false);
      }
    };
    
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold mb-4">Query Invalidation Test Cases</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mb-8">
        {/* Add the minimal example as a first-class card */}
        <MinimalExample />
        
        {/* Add a description card to explain the pattern */}
        <Card className="border-amber-500">
          <CardHeader className="bg-amber-50">
            <CardTitle>Why This Pattern Works</CardTitle>
          </CardHeader>
          <CardContent className="prose">
            <div className="space-y-2">
              <p className="font-medium">The essential pattern with Effect framework:</p>
              
              <ol className="list-decimal pl-4 space-y-2">
                <li><strong>Create a query key factory</strong> once, at module level</li>
                <li><strong>Generate fresh keys</strong> both when querying and invalidating</li>
                <li><strong>Use Effect for invalidation</strong> with useEffectMutation</li>
                <li><strong>Try both exact and non-exact matching</strong> for reliability</li>
              </ol>
              
              <p className="text-sm text-muted-foreground mt-2">
                The Effect framework makes this pattern more robust with built-in error handling, logging, and typed results
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <h3 className="text-xl font-bold mb-4">Other Implementation Approaches</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* First card: Direct Key Approach */}
        <Card>
          <CardHeader className="bg-blue-50">
            <CardTitle>Direct Key Approach</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-2">Using fixed array TEST_QUERY_KEY directly</p>
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
                disabled={manualLoading}
                variant="outline"
                className="border-blue-500"
                size="sm"
              >
                {manualLoading ? "Invalidating..." : "Hook Invalidate"}
              </Button>
              
              <Button 
                onClick={handleDirectInvalidate} 
                disabled={manualLoading}
                variant="outline"
                className="border-blue-500"
                size="sm"
              >
                Direct Invalidate
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
        
        {/* Include the other test components in the grid */}
        <TestWithFactoryKey />
        <TestEffectfulInvalidation />
        <QueryHelperDemo />
      </div>
      
      {/* Add the variable query key test section */}
      <div className="mt-12 pt-4 border-t">
        <TestWithVars />
      </div>
    </div>
  );
}