/**
 * Root Index Route
 *
 * Redirects to the main songmaking course.
 */

import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({
      to: "/$courseSlug",
      params: { courseSlug: "songmaking" },
    });
  },
  component: () => null,
});
