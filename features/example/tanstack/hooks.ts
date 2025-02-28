import { useEffectQuery, useEffectMutation, queryClient } from "@/features/global/lib/utils/tanstack-query"
import { ExampleService } from "../example.service"
import { createQueryKey, createQueryDataHelpers } from "@/features/global/lib/utils/query-data-helpers"
import { Example } from "../types/example.type"
import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Effect as E } from "effect"

// Create a simple query key without using the helper
export const TEST_QUERY_KEY = ["test"] as const;

// Create a fixed key helper that uses the same factory function 
export const testHelper = {
  invalidateAllQueries: async () => {
    // Get the factory key at invalidation time
    const factoryKey = testQueryKey();
    console.log("Custom testHelper: Invalidating with factory key:", factoryKey);
    
    // Log both keys to understand what's happening
    console.log("Factory key:", factoryKey);
    console.log("Static TEST_QUERY_KEY:", TEST_QUERY_KEY);
    console.log("Keys match by JSON comparison:", JSON.stringify(factoryKey) === JSON.stringify(TEST_QUERY_KEY));
    
    // First try with the factory key (reference equality matters for React Query)
    console.log("Invalidating with factory key");
    const result = await queryClient.invalidateQueries({ queryKey: factoryKey });
    
    // If factory key didn't work for some reason, try with the static key
    console.log("Also invalidating with static key just to be safe");
    await queryClient.invalidateQueries({ queryKey: TEST_QUERY_KEY });
    
    console.log("Custom testHelper: Invalidation complete");
    return result;
  },
  // Add other methods if needed
}

// Use the helper for demonstration, but we'll use direct key helper
const testQueryKey = createQueryKey("test")
export const factoryHelper = createQueryDataHelpers<Example[]>(testQueryKey)

// Example usage:
// To invalidate all test queries:
// await testHelper.invalidateAllQueries()
// 
// Or if you need to specify variables (even though there are none):
// await testHelper.invalidateQuery(undefined)

export const useTestQuery = () => {
    // Use factory key for consistency with our invalidation approach
    const queryKey = testQueryKey();
    
    // Log the key being used for the query
    console.log("useTestQuery using factory key:", queryKey);
    
    return useEffectQuery({
        queryKey,
        queryFn: () => ExampleService.getAll(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

/**
 * Hook that returns a function to invalidate the test query
 * Using useQueryClient directly from React Query 
 */
export const useInvalidateTestQuery = () => {
    // Get query client from the hook
    const queryClient = useQueryClient();
    // Use the factory function for the key to ensure consistency
    const queryKey = testQueryKey();
    
    const invalidate = useCallback(async () => {
        try {
            console.log("About to invalidate queries with factory key:", queryKey);
            console.log("Current cache keys:", [...queryClient.getQueryCache().getAll().map(q => q.queryKey)]);
            console.log("Current data:", queryClient.getQueryData(queryKey));
            
            // Attempt to invalidate with different exact settings
            console.log("Invalidating with exact:false");
            await queryClient.invalidateQueries({ queryKey, exact: false });
            
            console.log("Invalidating with exact:true");
            await queryClient.invalidateQueries({ queryKey, exact: true });
            
            // Check if we still have data after invalidation
            console.log("Data after invalidation:", queryClient.getQueryData(queryKey));
            console.log("Cache after invalidation:", [...queryClient.getQueryCache().getAll().map(q => q.queryKey)]);
            
            // Also try a direct refetchQueries call to compare behavior
            console.log("Attempting direct refetch");
            await queryClient.refetchQueries({ queryKey });
            
            console.log("Invalidation completed");
            return { success: true };
        } catch (error) {
            console.error("Error invalidating test query:", error);
            return { success: false, error };
        }
    }, [queryClient, queryKey]);

    return { invalidate, queryKey };
}

/**
 * Test hook that uses createQueryKey with useQueryClient
 * This will help us determine if the issue is with createQueryKey
 */
export const useTestWithFactoryKey = () => {
    // Important: using the factory function here
    const queryKey = testQueryKey();
    
    return useEffectQuery({
        queryKey,
        queryFn: () => ExampleService.getAll(),
        staleTime: 1000 * 60 * 5,
    });
}

/**
 * Invalidation hook for the factory key test
 */
export const useInvalidateTestWithFactoryKey = () => {
    const queryClient = useQueryClient();
    const queryKey = testQueryKey();  // Using factory function
    
    const invalidate = useCallback(async () => {
        try {
            console.log("About to invalidate queries with factory key:", queryKey);
            console.log("Current cache keys:", [...queryClient.getQueryCache().getAll().map(q => q.queryKey)]);
            
            // Try invalidating with exact:true first
            console.log("Invalidating with exact:true");
            await queryClient.invalidateQueries({ queryKey, exact: true });
            
            // Then try with exact:false
            console.log("Invalidating with exact:false");
            await queryClient.invalidateQueries({ queryKey, exact: false });
            
            // Check if we still have data after invalidation
            console.log("Data after invalidation:", queryClient.getQueryData(queryKey));
            console.log("Cache after invalidation:", [...queryClient.getQueryCache().getAll().map(q => q.queryKey)]);
            
            console.log("Factory key invalidation completed");
            return { success: true };
        } catch (error) {
            console.error("Error invalidating with factory key:", error);
            return { success: false, error };
        }
    }, [queryClient, queryKey]);
    
    return { invalidate, queryKey };
}

/**
 * Custom error type for Effect framework
 */
export class InvalidationError {
  readonly _tag = 'InvalidationError'
  constructor(readonly message: string) {}
}

/**
 * A hook that uses Effect framework with useEffectMutation to perform invalidation
 * This will help us determine if the issue is with the testHelper methods
 * Uses Effect's tryPromise for more idiomatic handling
 */
export const useEffectfulInvalidation = () => {
  const queryClient = useQueryClient();
  
  return useEffectMutation({
    mutationKey: ["invalidateTest"],
    mutationFn: (_: undefined) => {
      // Create and return the Effect directly
      return E.gen(function* () {
        console.log("Starting effectful invalidation process");
        
        // Log the keys being used to better understand the issue
        const factoryKey = testQueryKey();
        console.log("Factory key:", factoryKey);
        console.log("Direct key:", TEST_QUERY_KEY);
        
        // Deep inspection of the keys
        console.log("Factory key details:", {
          value: factoryKey,
          type: typeof factoryKey,
          isArray: Array.isArray(factoryKey),
          length: factoryKey.length,
          firstItem: factoryKey[0],
          firstItemType: typeof factoryKey[0],
          stringify: JSON.stringify(factoryKey)
        });
        
        console.log("Direct key details:", {
          value: TEST_QUERY_KEY,
          type: typeof TEST_QUERY_KEY,
          isArray: Array.isArray(TEST_QUERY_KEY),
          length: TEST_QUERY_KEY.length,
          firstItem: TEST_QUERY_KEY[0],
          firstItemType: typeof TEST_QUERY_KEY[0],
          stringify: JSON.stringify(TEST_QUERY_KEY)
        });
        
        // Get the actual key that factoryHelper would use to invalidate
        console.log("factoryHelper internals inspection:");
        try {
          // @ts-ignore - Accessing internal function for debugging
          const namespaceKey = testQueryKey(undefined as any)[0]; 
          console.log("factoryHelper namespace key:", namespaceKey);
          
          // Log what query keys we find in the cache
          const matchingQueries = queryClient.getQueryCache().findAll({ 
            queryKey: ['test'],
            exact: false 
          });
          console.log("Matching queries with ['test']:", matchingQueries.map(q => ({
            key: q.queryKey,
            state: q.state.status
          })));
          
          // Also check with the factoryKey
          const factoryMatches = queryClient.getQueryCache().findAll({ 
            queryKey: factoryKey,
            exact: true 
          });
          console.log("Matching queries with factoryKey:", factoryMatches.map(q => ({
            key: q.queryKey,
            state: q.state.status
          })));
        } catch (e) {
          console.error("Error inspecting factoryHelper:", e);
        }
        
        // Cache keys before invalidation
        console.log("Cache keys before:", [...queryClient.getQueryCache().getAll().map(q => ({
          key: q.queryKey,
          status: q.state.status,
          dataUpdatedAt: new Date(q.state.dataUpdatedAt).toISOString()
        }))]);
        
        // First try using the query helper - this likely doesn't work due to key mismatch
        yield* E.promise(() => {
          console.log("Calling factoryHelper.invalidateAllQueries()");
          return factoryHelper.invalidateAllQueries();
        });
        
        // Check cache state after factory helper invalidation
        console.log("Cache keys after factoryHelper.invalidateAllQueries():", [...queryClient.getQueryCache().getAll().map(q => ({
          key: q.queryKey,
          status: q.state.status,
          dataUpdatedAt: new Date(q.state.dataUpdatedAt).toISOString()
        }))]);
        
        // Now try with our direct helper
        yield* E.promise(() => {
          console.log("Calling direct testHelper.invalidateAllQueries()");
          return testHelper.invalidateAllQueries();
        });
        
        console.log("Cache after direct testHelper invalidation:", [...queryClient.getQueryCache().getAll().map(q => ({
          key: q.queryKey,
          status: q.state.status,
          dataUpdatedAt: new Date(q.state.dataUpdatedAt).toISOString()
        }))]);
        
        return { success: true };
      });
    }
  });
};

/**
 * A direct approach to invalidation that bypasses the helper
 * This will help determine if the issue is in the helper or elsewhere
 */
export const useDirectInvalidation = () => {
  const queryClient = useQueryClient();
  
  const invalidate = useCallback(async () => {
    try {
      // Log before
      console.log("Direct invalidation - Current query cache:", 
        queryClient.getQueryCache().getAll().map(q => ({
          key: q.queryKey,
          state: q.state
        }))
      );
      
      // Force refetch all queries - most aggressive approach
      console.log("Direct invalidation - Force refetching all queries");
      await queryClient.refetchQueries({ type: 'all' });
      
      // Log after
      console.log("Direct invalidation - Query cache after refetch:", 
        queryClient.getQueryCache().getAll().map(q => ({
          key: q.queryKey,
          state: q.state
        }))
      );
      
      return { success: true };
    } catch (error) {
      console.error("Error in direct invalidation:", error);
      return { success: false, error };
    }
  }, [queryClient]);
  
  return { invalidate };
}

/**
 * Debug function to help us understand how the factory helper creates and uses keys
 * Now accepts queryClient as a parameter instead of using useQueryClient hook
 */
export const debugFactoryHelper = (queryClient: any) => {
  // First, get what TEST_QUERY_KEY we're using for our query
  console.log("=== QUERY KEY DEBUG INFO ===");
  console.log("TEST_QUERY_KEY:", TEST_QUERY_KEY);
  console.log("Type:", typeof TEST_QUERY_KEY);
  console.log("Is array:", Array.isArray(TEST_QUERY_KEY));
  // Can't do direct array comparison, but we can check contents
  console.log("First element comparison:", TEST_QUERY_KEY[0] === "test");
  console.log("JSON comparison:", JSON.stringify(TEST_QUERY_KEY) === JSON.stringify(["test"]));
  
  // Next, check the factory-generated key
  const generatedKey = testQueryKey();
  console.log("\n=== FACTORY GENERATED KEY ===");
  console.log("generatedKey:", generatedKey);
  console.log("Type:", typeof generatedKey);
  console.log("Is array:", Array.isArray(generatedKey));
  // Compare elements instead of references
  console.log("First element comparison:", generatedKey[0] === TEST_QUERY_KEY[0]);
  console.log("JSON comparison with TEST_QUERY_KEY:", JSON.stringify(generatedKey) === JSON.stringify(TEST_QUERY_KEY));
  
  // Inspect what the helper is using for invalidation
  console.log("\n=== FACTORY HELPER INVALIDATION KEY ===");
  try {
    // This is accessing the internals of how factory helper works for debugging
    const namespaceKey = testQueryKey()[0];
    console.log("Namespace key used by helper:", namespaceKey);
    console.log("Type:", typeof namespaceKey);
    
    // Check the query cache for what's currently stored
    console.log("\n=== CURRENT QUERY CACHE ===");
    const allQueries = queryClient.getQueryCache().getAll();
    console.log("Total queries in cache:", allQueries.length);
    
    // Find all queries with keys that match our test key or its parts
    console.log("\n=== QUERIES MATCHING 'test' ===");
    allQueries.forEach((query: any) => {
      const key = query.queryKey;
      // Compare by values, not references
      const matchesTestString = key[0] === 'test';
      const matchesTestKeyJson = JSON.stringify(key) === JSON.stringify(TEST_QUERY_KEY);
      const matchesFactoryKeyJson = JSON.stringify(key) === JSON.stringify(generatedKey);
      
      if (matchesTestString || matchesTestKeyJson || matchesFactoryKeyJson) {
        console.log({
          key,
          keyJson: JSON.stringify(key),
          matchesTestString,
          matchesTestKeyJson,
          matchesFactoryKeyJson,
          status: query.state.status,
          lastUpdated: new Date(query.state.dataUpdatedAt).toISOString()
        });
      }
    });
    
  } catch (e) {
    console.error("Error in debug function:", e);
  }
  
  return { 
    directKey: TEST_QUERY_KEY, 
    factoryKey: generatedKey
  };
}

/**
 * ============================================
 * VARIABLE QUERY KEY EXAMPLE
 * ============================================
 */

// Define a type for our test variables
type TestVariables = {
  id?: string;
  filter?: string;
};

// Create a typed query key factory that accepts variables
export const testWithVarsQueryKey = createQueryKey<"testWithVars", TestVariables>("testWithVars");

// Create a helper to manage these queries
export const testWithVarsHelper = createQueryDataHelpers<Example[], TestVariables>(testWithVarsQueryKey);

/**
 * Hook to fetch data with specific variables
 */
export const useTestWithVarsQuery = (variables: TestVariables) => {
  // Create a key with variables
  const queryKey = testWithVarsQueryKey(variables);
  
  // Log the key being used
  console.log(`useTestWithVarsQuery using key with variables:`, queryKey);
  
  return useEffectQuery({
    queryKey,
    queryFn: () => {
      console.log(`Fetching data for variables:`, variables);
      return ExampleService.getAll().pipe(E.map(examples => {
        // Simulate filtering based on variables
        if (variables.id) {
          return examples.filter(ex => ex.id.includes(variables.id || ''));
        }
        if (variables.filter) {
          return examples.filter(ex => 
            ex.title?.toLowerCase().includes(variables.filter?.toLowerCase() || '') ||
            ex.content?.toLowerCase().includes(variables.filter?.toLowerCase() || '')
          );
        }
        return examples;
      }));
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to invalidate a specific query with variables
 */
export const useInvalidateTestWithVars = () => {
  const queryClient = useQueryClient();
  
  const invalidateSpecific = useCallback(async (variables: TestVariables) => {
    try {
      console.log("Invalidating specific query with variables:", variables);
      console.log("Query key:", testWithVarsQueryKey(variables));
      
      // Use testWithVarsHelper to invalidate the specific query
      await testWithVarsHelper.invalidateQuery(variables);
      
      console.log("Specific invalidation complete for:", variables);
      return { success: true };
    } catch (error) {
      console.error("Error invalidating specific query:", error);
      return { success: false, error };
    }
  }, []);
  
  const invalidateAll = useCallback(async () => {
    try {
      console.log("Invalidating all variable queries");
      
      // Use testWithVarsHelper to invalidate all queries in the namespace
      await testWithVarsHelper.invalidateAllQueries();
      
      console.log("All variable queries invalidated");
      return { success: true };
    } catch (error) {
      console.error("Error invalidating all variable queries:", error);
      return { success: false, error };
    }
  }, []);
  
  return { invalidateSpecific, invalidateAll };
}


