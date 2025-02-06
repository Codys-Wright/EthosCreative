export type Role =
  | "LEAD_DEVELOPER"
  | "DEVELOPER"
  | "ADMIN"
  | "COACH"
  | "SUPPORT"
  | "MODERATOR"
  | "TESTER"
  | "USER"
  | "GUEST"

// Resource types
export interface Project {
  id: string
  name: string
  ownerId: string
  teamId?: string
  collaborators: string[]
}

export interface TimeEntry {
  id: string
  userId: string
  projectId: string
  duration: number
  date: Date
}

export interface Profile {
  id: string
  userId: string
  teamId?: string
  role: Role
}

// Permission system types
export type PermissionCheck<Key extends keyof Permissions> =
  | boolean
  | ((user: User, data: Permissions[Key]["dataType"]) => boolean)

export interface User {
  id: string
  roles: Role[]
  blockedBy: string[]
}

// Helper type for role combinations
export type RoleCombination = Role[]

const ROLE_LEVELS: Record<Role, number> = {
  LEAD_DEVELOPER: 7,
  DEVELOPER: 6,
  ADMIN: 5,
  COACH: 4,
  SUPPORT: 3,
  MODERATOR: 2,
  TESTER: 1,
  USER: 0,
  GUEST: -1,
}

// Helper functions to check role combinations
export function hasRole(roles: Role | Role[], role: Role): boolean {
  return Array.isArray(roles) ? roles.includes(role) : roles === role
}

export function hasAnyRole(
  roles: Role | Role[],
  requiredRoles: Role[]
): boolean {
  return Array.isArray(roles)
    ? requiredRoles.some((role) => roles.includes(role))
    : requiredRoles.includes(roles)
}

export function hasAllRoles(
  roles: Role | Role[],
  requiredRoles: Role[]
): boolean {
  return Array.isArray(roles)
    ? requiredRoles.every((role) => roles.includes(role))
    : requiredRoles.every((role) => role === roles)
}

// Get the highest role level for permission inheritance
export function getHighestRoleLevel(roles: Role | Role[]): number {
  if (!roles) return ROLE_LEVELS.GUEST

  const roleArray = Array.isArray(roles) ? roles : [roles]
  return Math.max(...roleArray.map((role) => ROLE_LEVELS[role]))
}

export type RolesWithPermissions = {
  [R in Role]: Partial<{
    [Key in keyof Permissions]: Partial<{
      [Action in Permissions[Key]["action"]]: PermissionCheck<Key>
    }>
  }>
}

export type Permissions = {
  projects: {
    dataType: Project
    action: "view" | "create" | "update" | "delete" | "manage"
  }
  timeEntries: {
    dataType: TimeEntry
    action: "view" | "create" | "update" | "delete"
  }
  profiles: {
    dataType: Profile
    action: "view" | "update" | "manage"
  }
}
