"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useTestWithVarsQuery, useInvalidateTestWithVars } from "./hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function TestWithVars() {
  // State for our filter variables
  const [idFilter, setIdFilter] = useState("");
  const [textFilter, setTextFilter] = useState("");
  
  // Create two separate queries with different variables
  const { 
    data: idFilteredData, 
    isLoading: isLoadingIdData, 
    status: idStatus,
    fetchStatus: idFetchStatus,
    refetch: refetchIdData
  } = useTestWithVarsQuery({ id: idFilter || undefined });
  
  const { 
    data: textFilteredData, 
    isLoading: isLoadingTextData, 
    status: textStatus,
    fetchStatus: textFetchStatus,
    refetch: refetchTextData
  } = useTestWithVarsQuery({ filter: textFilter || undefined });
  
  // Invalidation hooks
  const { invalidateSpecific, invalidateAll } = useInvalidateTestWithVars();
  const [isInvalidatingId, setIsInvalidatingId] = useState(false);
  const [isInvalidatingText, setIsInvalidatingText] = useState(false);
  const [isInvalidatingAll, setIsInvalidatingAll] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Log query statuses
  useEffect(() => {
    console.log(`ID Query - Status: ${idStatus}, Fetch: ${idFetchStatus}`);
  }, [idStatus, idFetchStatus, idFilteredData]);
  
  useEffect(() => {
    console.log(`Text Query - Status: ${textStatus}, Fetch: ${textFetchStatus}`);
  }, [textStatus, textFetchStatus, textFilteredData]);
  
  // Handle ID filter change
  const handleIdFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIdFilter(e.target.value);
  };
  
  // Handle text filter change
  const handleTextFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextFilter(e.target.value);
  };
  
  // Invalidate ID query
  const handleInvalidateId = async () => {
    setIsInvalidatingId(true);
    try {
      console.log("Invalidating ID query with filter:", idFilter);
      const result = await invalidateSpecific({ id: idFilter || undefined });
      
      if (result.success) {
        toast.success("ID query invalidated successfully");
      } else {
        toast.error("Failed to invalidate ID query");
      }
    } catch (error: any) {
      console.error("Error invalidating ID query:", error);
      toast.error(`Error: ${error?.message || String(error)}`);
    } finally {
      setIsInvalidatingId(false);
    }
  };
  
  // Invalidate text query
  const handleInvalidateText = async () => {
    setIsInvalidatingText(true);
    try {
      console.log("Invalidating Text query with filter:", textFilter);
      const result = await invalidateSpecific({ filter: textFilter || undefined });
      
      if (result.success) {
        toast.success("Text query invalidated successfully");
      } else {
        toast.error("Failed to invalidate text query");
      }
    } catch (error: any) {
      console.error("Error invalidating text query:", error);
      toast.error(`Error: ${error?.message || String(error)}`);
    } finally {
      setIsInvalidatingText(false);
    }
  };
  
  // Invalidate all queries
  const handleInvalidateAll = async () => {
    setIsInvalidatingAll(true);
    try {
      console.log("Invalidating all variable queries");
      const result = await invalidateAll();
      
      if (result.success) {
        toast.success("All variable queries invalidated");
      } else {
        toast.error("Failed to invalidate all queries");
      }
    } catch (error: any) {
      console.error("Error invalidating all queries:", error);
      toast.error(`Error: ${error?.message || String(error)}`);
    } finally {
      setIsInvalidatingAll(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Query Keys with Variables</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ID Filter Query Card */}
        <Card className="border-blue-500">
          <CardHeader className="bg-blue-50">
            <CardTitle>ID Filter Query</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="id-filter" className="text-sm font-medium">
                Filter by ID:
              </label>
              <div className="flex gap-2">
                <Input
                  id="id-filter"
                  placeholder="Enter ID or part of it"
                  value={idFilter}
                  onChange={handleIdFilterChange}
                />
                <Button size="sm" onClick={() => refetchIdData()}>Apply</Button>
              </div>
            </div>
            
            <div>
              <p>Status: {idStatus} (Fetch: {idFetchStatus})</p>
              {isLoadingIdData ? (
                <p>Loading...</p>
              ) : idFilteredData?.length ? (
                <div className="mt-2 border-t pt-2">
                  <p className="font-semibold">Data ({idFilteredData.length} items):</p>
                  {idFilteredData.map((item) => (
                    <p key={item.id} className="ml-2 truncate">
                      <span className="font-mono text-xs text-blue-600">{item.id}</span> - {item.title || "(No title)"}
                    </p>
                  )).slice(0, 3)}
                  {idFilteredData.length > 3 && (
                    <p className="ml-2 text-sm text-muted-foreground">+ {idFilteredData.length - 3} more items</p>
                  )}
                </div>
              ) : (
                <p>No data available</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleInvalidateId} 
              disabled={isInvalidatingId}
              variant="outline"
              className="border-blue-500"
              size="sm"
            >
              {isInvalidatingId ? "Invalidating..." : "Invalidate This Query"}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Text Filter Query Card */}
        <Card className="border-purple-500">
          <CardHeader className="bg-purple-50">
            <CardTitle>Text Filter Query</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <label htmlFor="text-filter" className="text-sm font-medium">
                Filter by text:
              </label>
              <div className="flex gap-2">
                <Input
                  id="text-filter"
                  placeholder="Search title or content"
                  value={textFilter}
                  onChange={handleTextFilterChange}
                />
                <Button size="sm" onClick={() => refetchTextData()}>Apply</Button>
              </div>
            </div>
            
            <div>
              <p>Status: {textStatus} (Fetch: {textFetchStatus})</p>
              {isLoadingTextData ? (
                <p>Loading...</p>
              ) : textFilteredData?.length ? (
                <div className="mt-2 border-t pt-2">
                  <p className="font-semibold">Data ({textFilteredData.length} items):</p>
                  {textFilteredData.map((item) => (
                    <p key={item.id} className="ml-2 truncate">• {item.title || "(No title)"}</p>
                  )).slice(0, 3)}
                  {textFilteredData.length > 3 && (
                    <p className="ml-2 text-sm text-muted-foreground">+ {textFilteredData.length - 3} more items</p>
                  )}
                </div>
              ) : (
                <p>No data available</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleInvalidateText} 
              disabled={isInvalidatingText}
              variant="outline"
              className="border-purple-500"
              size="sm"
            >
              {isInvalidatingText ? "Invalidating..." : "Invalidate This Query"}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div className="flex justify-center mt-4">
        <Button 
          onClick={handleInvalidateAll} 
          disabled={isInvalidatingAll}
          variant="default"
          className="bg-gradient-to-r from-blue-500 to-purple-500"
        >
          {isInvalidatingAll ? "Invalidating..." : "Invalidate All Variable Queries"}
        </Button>
      </div>
    </div>
  );
} 