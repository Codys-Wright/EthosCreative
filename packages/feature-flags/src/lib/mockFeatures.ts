import { FeatureFlag } from "../types"

export const MOCK_FEATURES: Record<string, FeatureFlag> = {
  dashboard_page: {
    id: "dashboard_page",
    name: "Dashboard",
    description: "Main dashboard page",
    state: "released",
    createdAt: "2024-01-01",
  },
  profile_switcher: {
    id: "profile_switcher",
    name: "Profile Switcher",
    description: "Dropdown menu for switching between profiles",
    state: "disabled",
    createdAt: new Date().toISOString(),
  },
  courses_page: {
    id: "courses_page",
    name: "Courses",
    description: "Course management page",
    state: "new",
    createdAt: new Date().toISOString(),
  },
  projects_page: {
    id: "projects_page",
    name: "Projects",
    description: "Project management page",
    state: "coming_soon",
    createdAt: "2024-01-01",
  },
  profile_page: {
    id: "profile_page",
    name: "Profile",
    description: "User profile page",
    state: "beta",
    createdAt: "2024-01-01",
  },
  charts_page: {
    id: "charts_page",
    name: "Charts",
    description: "Analytics and charts page",
    state: "hidden",
    createdAt: "2024-01-01",
  },
  chats_page: {
    id: "chats_page",
    name: "Chats",
    description: "Team chat page",
    state: "coming_soon",
    createdAt: "2024-01-01",
  },
  tracking_page: {
    id: "tracking_page",
    name: "Tracking",
    description: "Progress tracking page",
    state: "hidden",
    createdAt: "2024-01-01",
  },
  schedule_page: {
    id: "schedule_page",
    name: "Schedule",
    description: "Schedule management page",
    state: "hidden",
    createdAt: "2024-01-01",
  },
  settings_page: {
    id: "settings_page",
    name: "Settings",
    description: "Application settings page",
    state: "released",
    createdAt: "2024-01-01",
  },
  admin_dashboard: {
    id: "admin_dashboard",
    name: "Admin Dashboard",
    description: "Admin control panel",
    state: "admin_only",
    createdAt: "2024-01-01",
  },
  dev_dashboard: {
    id: "dev_dashboard",
    name: "Developer Dashboard",
    description: "Developer tools and settings",
    state: "hidden", // Only visible to developers
    createdAt: "2024-01-01",
  },
}
