import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

/**
 * Next.js configuration with Turbopack and Sentry compatibility
 *
 * This solves the warning: "Webpack is configured while Turbopack is not"
 * by conditionally applying Sentry only in production builds and
 * using a clean configuration for Turbopack in development.
 */

// Base configuration used by both Webpack and Turbopack
const baseConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "x4ml1657p3.ufs.sh",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      // Add other patterns as needed
    ],
    domains: ["localhost"],
    unoptimized: true, // Disable image optimization to avoid issues with external domains
  },
};

// Development-only configuration (will use Turbopack)
const devConfig: NextConfig = {
  ...baseConfig,
  // Empty webpack config to avoid conflicts with Turbopack
  webpack: undefined,
};

// Production configuration with Sentry integration
const prodConfig = withSentryConfig(baseConfig, {
  org: "fasttrackaudio",
  project: "my-artist-type",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  reactComponentAnnotation: {
    enabled: true,
  },
  disableLogger: true,
  automaticVercelMonitors: true,
});

// Use different configs based on environment
const config = process.env.NODE_ENV === "development" ? devConfig : prodConfig;

export default config;
