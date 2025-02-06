import { Role } from "../roles-permissions/types"

export type FeatureState =
  | "disabled" // Feature is completely disabled
  | "hidden" // Only visible to developers
  | "coming_soon" // Visible to all, but only devs can interact
  | "testing" // Percentage-based rollout
  | "beta" // Available to users with tester role
  | "released" // Available to everyone
  | "new" // Available to everyone with "new" badge
  | "admin_only" // Only visible to admins

export interface FeatureFlag {
  id: string
  name: string
  description: string
  state: FeatureState
  rolloutPercentage?: number // For testing state
  createdAt: string // For "new" badge timing
}

export interface FeatureStateConfig {
  isVisible: (roles: Role[]) => boolean
  isEnabled: (roles: Role[], userId?: string) => boolean
  badge?: {
    text: string
    className: string
  }
}

// Helper type for feature flag hooks
export interface UseFeatureFlag {
  isVisible: boolean
  isEnabled: boolean
  state: FeatureState
  badge?: {
    text: string
    className: string
  }
}

// Helper type for mock features
export type FeatureId =
  | "dashboard_page"
  | "courses_page"
  | "projects_page"
  | "profile_page"
  | "charts_page"
  | "chats_page"
  | "tracking_page"
  | "schedule_page"
  | "settings_page"
  | "admin_dashboard"
  | "dev_dashboard"
  | "profile_switcher"
