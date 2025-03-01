"use client"

import { useState } from "react"
import { createQueryKey, createQueryDataHelpers } from "@/features/global/lib/utils/query-data-helpers"
import { ExampleService } from "../example.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { toast } from "sonner"
import { Example } from "../types/example.type"
import { useEffectQuery } from "@/features/global/lib/utils/tanstack-query"
import { useCallback } from "react"

/**
 * A minimal implementation with proper separation of concerns
 * using the query data helpers pattern
 */

// 1. Create your query key factory (module level)
const simpleQueryKey = createQueryKey("simple")

// 2. Create a helper for query data management
const simpleHelper = createQueryDataHelpers<Example[]>(simpleQueryKey)

// 3. Data access layer - handles queries and mutations
export const simpleExampleService = {
  // Get data
  useQuery: () => {
    return useEffectQuery({
      queryKey: simpleQueryKey(),
      queryFn: () => ExampleService.getAll(),
      staleTime: 1000 * 60
    })
  },
  
  // Update data with built-in loading state, toasts, and error handling
  useUpdate: () => {
    const [isUpdating, setIsUpdating] = useState(false)
    
    const update = useCallback(async () => {
      // Don't do anything if already updating
      if (isUpdating) return
      
      setIsUpdating(true)
      
      try {
        console.log("Starting data update operation")
        
        // Here you would typically make an API call to update data
        // const result = await updateDataSomehow()
        
        // Use the query data helper to invalidate all queries in this namespace
        await simpleHelper.invalidateAllQueries();
        
        console.log("Cache invalidation completed");
        toast.success("Data updated successfully");
      } catch (error) {
        console.error("Update operation error:", error);
        toast.error("Update operation failed");
      } finally {
        setIsUpdating(false)
      }
    }, [isUpdating])
    
    return { update, isUpdating }
  }
}

// 4. Component that uses the service, with no knowledge of caching details
export function MinimalExample() {
  // Use the query through our service
  const { data, isLoading, status, refetch } = simpleExampleService.useQuery()
  
  // Get the update function and loading state from our service
  const { update, isUpdating } = simpleExampleService.useUpdate()
  
  return (
    <Card className="border-amber-500">
      <CardHeader className="bg-amber-50">
        <CardTitle>Query Helpers Pattern</CardTitle>
      </CardHeader>
      
      <CardContent>
        <p className="mb-2">Component with full separation of concerns</p>
        <p>Status: {status}</p>
        
        <div className="mt-2">
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <div className="mt-2 border-t pt-2">
              <p className="font-semibold">Data loaded: {data?.length || 0} items</p>
              {data && data.length > 0 && (
                <>
                  {data.slice(0, 2).map((item: Example) => (
                    <p key={item.id} className="ml-2 truncate">• {item.title || item.id}</p>
                  ))}
                  {data.length > 2 && <p className="ml-2 text-sm text-muted-foreground">+ {data.length - 2} more items</p>}
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <div className="flex gap-2">
          <Button 
            onClick={update} 
            disabled={isUpdating}
            variant="outline"
            className="border-amber-500"
            size="sm"
          >
            {isUpdating ? "Updating..." : "Update Data"}
          </Button>
          
          <Button 
            onClick={() => refetch()} 
            disabled={isLoading}
            variant="ghost"
            size="sm"
          >
            Refresh
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
} 