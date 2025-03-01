import {
  QueryClient,
  QueryFunction,
  QueryFunctionContext,
  skipToken,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query";
import { Duration, Effect } from "effect";
import { DurationInput } from "effect/Duration";
import React from "react";
import { RuntimeContext } from "../runtime/runtime-context";
import { useRuntime } from "../runtime/use-runtime";

/**
 * Represents an instance of a QueryClient configured with default options for data fetching and caching.
 *
 * This client is configured to manage query caching behavior and optimize data-fetching in an application.
 * The default options set for queries include:
 * - A stale time of 1 minute, meaning data will be considered fresh for this duration.
 * - Disabled retry mechanism, so failed queries will not automatically retry.
 * - Refetch on window focus is turned off to prevent automatic data refetch when the browser window regains focus.
 *
 * The QueryClient is typically used as the central instance to handle query and cache mechanisms across the application.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Duration.toMillis("1 minute"),
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * A React hook function that creates a callback to execute effects within a runtime context.
 *
 * This hook utilizes the `useRuntime` hook to obtain the current runtime context
 * and returns a memoized callback using `React.useCallback`. The callback accepts a
 * span (as a string) and an effect, then executes the effect, applying the following:
 * 1. Associates the effect with the provided span using `Effect.withSpan()`.
 * 2. Logs any error causes using `Effect.tapErrorCause(Effect.logError)`.
 * 3. Runs the effect as a promise using the runtime's `runPromise` method.
 *
 * Dependencies:
 * - `runtime.runPromise` from the `useRuntime()` context is used as a dependency for memoization.
 *
 * @returns {Function} A memoized callback that runs the given effect with a defined span and logs errors.
 */
const useRunner = () => {
  const runtime = useRuntime();
  return React.useCallback(
    <A, E, R extends RuntimeContext>(span: string) =>
      (effect: Effect.Effect<A, E, R>): Promise<A> =>
        effect.pipe(
          Effect.withSpan(span),
          Effect.tapErrorCause(Effect.logError),
          runtime.runPromise,
        ),
    [runtime.runPromise],
  );
};

/**
 * Represents a unique key for identifying a specific query with optional parameters.
 *
 * This tuple type is used to uniquely define a query by including a string as its primary key,
 * optionally combined with a set of parameters represented as a record.
 *
 * The first element in the tuple is a string representing the base key
 * for the query, which is required. The second element is an optional object
 * containing key-value pairs as the parameters used to further differentiate the query.
 */
type QueryKey = readonly [string, Record<string, unknown>?];
/**
 * Represents an error with an additional categorization or tagging property.
 * This provides a structure to handle errors with specific characteristics.
 *
 * `_tag` is used to identify the type or category of the error. It can be used
 * for distinguishing between different error types in a system or application.
 */
type EffectfulError = { _tag: string };

/**
 * Represents the configuration options for an effectful mutation.
 *
 * This type is a specialization of `UseMutationOptions` but provides precise control
 * over the `mutationFn` and related callbacks to support effectful workflows.
 *
 * @template TData - The type of data returned by the mutation.
 * @template TError - The type of custom error extending `EffectfulError` that may occur during mutation.
 * @template TVariables - The type of variables passed to the mutation function.
 * @template R - The runtime context used during the effectful mutation operation.
 */
type EffectfulMutationOptions<
  TData,
  TError extends EffectfulError,
  TVariables,
  R extends RuntimeContext,
> = Omit<
  UseMutationOptions<TData, Error, TVariables>,
  | "mutationFn"
  | "onSuccess"
  | "onError"
  | "onSettled"
  | "onMutate"
  | "retry"
  | "retryDelay"
> & {
  mutationKey: QueryKey;
  mutationFn: (variables: TVariables) => Effect.Effect<TData, TError, R>;
};

/**
 * A custom React hook for performing side-effectful mutations. This function integrates mutation
 * handling with an effect runner to manage side effects during the mutation process.
 *
 * @param {EffectfulMutationOptions<TData, TError, TVariables, R>} options - The configuration options for the mutation, including the mutation function, keys, and context.
 * @return {UseMutationResult<TData, Error, TVariables>} The mutation result object that contains state and helper methods for interacting with the mutation.
 */
export function useEffectMutation<
  TData,
  TError extends EffectfulError,
  TVariables,
  R extends RuntimeContext,
>(
  options: EffectfulMutationOptions<TData, TError, TVariables, R>,
): UseMutationResult<TData, Error, TVariables> {
  const effectRunner = useRunner();
  const [spanName] = options.mutationKey;

  const mutationFn = React.useCallback(
    (variables: TVariables) => {
      const effect = options.mutationFn(variables);
      return effect.pipe(effectRunner(spanName));
    },
    [effectRunner, spanName, options],
  );

  return useMutation<TData, Error, TVariables>({
    ...options,
    mutationFn,
  });
}

/**
 * Represents a function type intended for effectful data fetching in a query context.
 *
 * This function type is designed for scenarios involving asynchronous operations that return
 * a typed effect. It supports a highly typed context for managing parameters and outputs,
 * making it suitable for robust data-fetching use cases.
 *
 * @template TData The type of the data returned by the query.
 * @template TError The type of errors that can be encountered during query execution.
 * @template R The required runtime context for executing the effect.
 * @template TQueryKey Represents the key used to uniquely identify the query.
 * @template TPageParam (Optional) The type of the page parameter used in paginated queries.
 *
 * @param context The query function context, which provides necessary metadata and parameters
 *                for the query. This can include the query key, optional parameters, or other
 *                useful contextual information.
 *
 * @returns An effect that encapsulates the asynchronous computation, providing either
 *          the fetched data (`TData`) or an error (`TError`). The operation may also
 *          require a runtime environment (`R`).
 */
type EffectfulQueryFunction<
  TData,
  TError,
  R extends RuntimeContext,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = never,
> = (
  context: QueryFunctionContext<TQueryKey, TPageParam>,
) => Effect.Effect<TData, TError, R>;

/**
 * Defines the configuration options for an effectful query operation and
 * extends the base UseQueryOptions while allowing for customization of
 * certain properties.
 *
 * This type combines the core functionality from the `UseQueryOptions` type
 * while replacing or modifying specific properties to better handle runtime
 * contexts and effectful query functions.
 *
 * @template TData - The type of the data returned by the query function.
 * @template TError - The type of the error thrown by the query function.
 * @template R - The runtime context, extending `RuntimeContext`.
 * @template TQueryKey - The type of the query key, defaulting to `QueryKey`.
 * @template TPageParam - The type of the optional pagination parameter.
 *
 * @property queryKey - The key used to identify this query. Overrides the
 * corresponding property in UseQueryOptions.
 * @property queryFn - A function that performs the data fetching operation
 * or a skip token to conditionally skip execution of the query.
 * @property staleTime - An optional duration that specifies how long
 * the data is considered fresh.
 * @property gcTime - An optional duration to specify the time before the
 * cached data is garbage collected.
 */
type EffectfulQueryOptions<
  TData,
  TError,
  R extends RuntimeContext,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = never,
> = Omit<
  UseQueryOptions<TData, Error, TData, TQueryKey>,
  "queryKey" | "queryFn" | "retry" | "retryDelay" | "staleTime" | "gcTime"
> & {
  queryKey: TQueryKey;
  queryFn:
    | EffectfulQueryFunction<TData, TError, R, TQueryKey, TPageParam>
    | typeof skipToken;
  staleTime?: DurationInput;
  gcTime?: DurationInput;
};

/**
 * A custom hook that wraps around `useQuery` to perform effectful queries
 * in a manner suitable for React applications. This leverages an effect runner
 * to pipe through effectful logic and can be configured with specific options
 * for query behavior such as stale time and garbage collection time.
 *
 * @param {EffectfulQueryOptions<TData, TError, R, TQueryKey>} options - Configuration options for the effectful query. It includes properties such as:
 * - `queryKey`: A unique key for the query.
 * - `queryFn`: A function that resolves an effectful query.
 * - `gcTime`: Optional garbage collection time for the query as a duration.
 * - `staleTime`: Optional stale time for controlling automatic refetch intervals.
 * - Additional properties supported by `useQuery`.
 *
 * @return {UseQueryResult<TData, Error>} Returns an object representing the query result, including states like `data`, `isLoading`, and `error`.
 */
export function useEffectQuery<
  TData,
  TError extends EffectfulError,
  R extends RuntimeContext,
  TQueryKey extends QueryKey = QueryKey,
>({
  gcTime,
  staleTime,
  ...options
}: EffectfulQueryOptions<TData, TError, R, TQueryKey>): UseQueryResult<
  TData,
  Error
> {
  const effectRunner = useRunner();
  const [spanName] = options.queryKey;

  const queryFn: QueryFunction<TData, TQueryKey> = React.useCallback(
    (context: QueryFunctionContext<TQueryKey>) => {
      const effect = (
        options.queryFn as EffectfulQueryFunction<TData, TError, R, TQueryKey>
      )(context);
      return effect.pipe(effectRunner(spanName));
    },
    [effectRunner, spanName, options],
  );

  const queryOptions: UseQueryOptions<TData, Error, TData, TQueryKey> = {
    ...options,
    queryFn: options.queryFn === skipToken ? skipToken : queryFn,
    ...(staleTime !== undefined && { staleTime: Duration.toMillis(staleTime) }),
    ...(gcTime !== undefined && { gcTime: Duration.toMillis(gcTime) }),
  };

  return useQuery(queryOptions);
}

/**
 * Global utility to invalidate queries by key
 * 
 * This function wraps queryClient.invalidateQueries and provides consistent
 * invalidation behavior across the application. It first tries with exact:true
 * and then with exact:false to ensure thorough invalidation.
 * 
 * @param queryKey The query key to invalidate
 * @param options Optional invalidation options
 * @returns Promise that resolves when invalidation is complete
 */
export const invalidateQueries = async (
  queryKey: readonly unknown[],
  options?: { showToast?: boolean; exact?: boolean }
): Promise<void> => {
  const { showToast = false, exact } = options || {};
  
  try {
    console.log("Invalidating cache with key:", queryKey);
    
    if (exact !== undefined) {
      // Use the exact option provided
      await queryClient.invalidateQueries({ queryKey, exact });
    } else {
      // Try both exact true and false for thorough invalidation
      await queryClient.invalidateQueries({ queryKey, exact: true });
      await queryClient.invalidateQueries({ queryKey, exact: false });
    }
    
    console.log("Cache invalidation completed");
    
    // Optional toast notification
    if (showToast) {
      // If this utility is used in a non-React context, we can't import toast directly
      // So we'll need to find a way to access toast or handle it differently
      // Consider passing a callback for notification instead
      try {
        const { toast } = await import("sonner");
        toast.success("Data updated successfully");
      } catch (e) {
        console.log("Toast notification not available");
      }
    }
  } catch (error) {
    console.error("Cache invalidation failed:", error);
    
    if (showToast) {
      try {
        const { toast } = await import("sonner");
        toast.error("Update operation failed");
      } catch (e) {
        console.log("Toast notification not available");
      }
    }
    
    throw error;
  }
};
