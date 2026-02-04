/**
 * Course Layout Route
 *
 * This layout route handles course slug validation and provides
 * course data to child routes via CourseProvider.
 */

import {
  createFileRoute,
  Outlet,
  redirect,
  notFound,
} from "@tanstack/react-router";
import { getCourseBySlug } from "../data/course-registry";
import { CourseProvider } from "../features/course/client/course-context";
import { checkInstructor } from "../features/auth/check-instructor";

export const Route = createFileRoute("/$courseSlug")({
  beforeLoad: async ({ params }) => {
    const { courseSlug } = params;

    // Check if course exists (static data, no server function needed)
    const courseData = getCourseBySlug(courseSlug);

    if (!courseData) {
      throw notFound();
    }

    // Check admin access if required
    if (courseData.requiresAdmin) {
      const result = await checkInstructor();
      if (!result.isAuthenticated || !result.isInstructor) {
        throw redirect({
          to: "/auth/$authView",
          params: { authView: "sign-in" },
        });
      }
    }

    return { courseSlug };
  },
  component: CourseLayout,
});

function CourseLayout() {
  const { courseSlug } = Route.useParams();

  return (
    <CourseProvider courseSlug={courseSlug}>
      <Outlet />
    </CourseProvider>
  );
}
