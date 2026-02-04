/**
 * Environment variables for the quiz package.
 * These are read from the environment at runtime.
 */

const getApiUrl = () => {
  // Check Vite env first (client-side)
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Use window.location.origin in browser
  if (
    typeof window !== "undefined" &&
    window.location?.origin &&
    window.location.origin !== "null"
  ) {
    return window.location.origin;
  }
  // Check process.env (server-side)
  // Note: DEPLOY_URL is only available at build time on Netlify, not runtime
  if (process.env.API_URL) return process.env.API_URL;
  if (process.env.URL) return process.env.URL;
  return "http://localhost:3000";
};

export const envVars = {
  /** The current environment: 'dev' | 'prod' | 'test' */
  EFFECTIVE_ENV: (process.env.NODE_ENV ?? "dev") as "dev" | "prod" | "test",
  /** The API URL for client requests */
  API_URL: getApiUrl(),
} as const;
