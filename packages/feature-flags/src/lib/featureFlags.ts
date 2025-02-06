import { Role } from "../../roles-permissions/types"
import { FeatureState, FeatureStateConfig } from "../types"
import { murmurhash } from "./murmurhash"

const isDeveloper = (roles: Role[]) =>
  roles.some((role) => role === "DEVELOPER" || role === "LEAD_DEVELOPER")

const isTester = (roles: Role[]) =>
  roles.some((role) => role === "TESTER") || isDeveloper(roles)

const isAdmin = (roles: Role[]) =>
  roles.some((role) => role === "ADMIN" || role === "LEAD_DEVELOPER")

// Users who always get access to testing features
const TESTING_WHITELIST = [
  "user-123", // Example whitelisted user
  "beta-tester-1",
  "early-access-user",
  "kp_b1c5f05479d242d59ec57991b4084d35",
]

export const isWhitelisted = (userId?: string): boolean => {
  return Boolean(userId && TESTING_WHITELIST.includes(userId))
}

export const FEATURE_STATE_CONFIG: Record<FeatureState, FeatureStateConfig> = {
  disabled: {
    isVisible: () => false,
    isEnabled: () => false,
  },
  hidden: {
    isVisible: (roles: Role[]) => isDeveloper(roles),
    isEnabled: (roles: Role[]) => isDeveloper(roles),
    badge: {
      text: "Hidden",
      className: "bg-gray-100 text-gray-800",
    },
  },
  coming_soon: {
    isVisible: () => true,
    isEnabled: (roles: Role[]) => isDeveloper(roles),
    badge: {
      text: "Coming Soon",
      className: "bg-blue-100 text-blue-800",
    },
  },
  testing: {
    isVisible: (roles: Role[], userId?: string) =>
      isDeveloper(roles) || isWhitelisted(userId),
    isEnabled: (roles: Role[], userId?: string) =>
      isDeveloper(roles) || isWhitelisted(userId),
    badge: {
      text: "Testing",
      className: "bg-yellow-100 text-yellow-800",
    },
  },
  beta: {
    isVisible: () => true,
    isEnabled: (roles: Role[]) => isTester(roles),
    badge: {
      text: "Beta",
      className: "bg-purple-100 text-purple-800",
    },
  },
  released: {
    isVisible: () => true,
    isEnabled: () => true,
  },
  new: {
    isVisible: () => true,
    isEnabled: () => true,
    badge: {
      text: "New",
      className: "bg-green-100 text-green-800",
    },
  },
  admin_only: {
    isVisible: (roles: Role[]) => isAdmin(roles),
    isEnabled: (roles: Role[]) => isAdmin(roles),
    badge: {
      text: "Admin Only",
      className: "bg-red-100 text-red-800",
    },
  },
}

// Helper function to determine if a user is in the rollout group
export function isInRolloutGroup(
  userId: string = "guest",
  percentage: number = 0
): boolean {
  // Check whitelist first
  if (isWhitelisted(userId)) {
    return true
  }

  if (percentage <= 0) return false
  if (percentage >= 100) return true

  // Use murmurhash to get a consistent hash for the user ID
  const hash = murmurhash(userId)
  // Convert hash to a number between 0 and 100
  const userValue = hash % 100

  return userValue < percentage
}

// Helper to check if a feature should show "new" badge
export function isFeatureNew(createdAt: string): boolean {
  const featureDate = new Date(createdAt)
  const now = new Date()
  const daysSinceCreation = Math.floor(
    (now.getTime() - featureDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  return daysSinceCreation <= 7 // Show "new" badge for 7 days
}
