import { Role } from "./types"

const STORAGE_KEY = "user-roles"

interface UserRoleData {
  mainRole: Role
  isTester: boolean
}

// Get initial roles from localStorage or set defaults
function getInitialRoles(): Record<string, UserRoleData> {
  if (typeof window === "undefined") return {}

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return {}

  try {
    return JSON.parse(stored)
  } catch {
    return {}
  }
}

// In-memory store that's initialized from localStorage
let userRoles = getInitialRoles()

export function getUserRole(userId: string): UserRoleData {
  return (
    userRoles[userId] ?? {
      mainRole: "USER",
      isTester: false,
    }
  )
}

export function setUserRole(userId: string, role: Role) {
  const currentRole = getUserRole(userId)

  if (role === "TESTER") {
    // Toggle tester status
    userRoles[userId] = {
      ...currentRole,
      isTester: !currentRole.isTester,
    }
  } else {
    // Set main role while preserving tester status
    userRoles[userId] = {
      mainRole: role,
      isTester: currentRole.isTester,
    }
  }

  // Persist to localStorage
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userRoles))
  }
}

export function _clearMockData(): void {
  userRoles = {}
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY)
  }
}
