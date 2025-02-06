import { Role, getHighestRoleLevel } from "../types"
import { Post } from "./mock-posts"

interface PostPermissions {
  view: boolean
  create: boolean
  delete: boolean
  invite: boolean
}

export function getPostPermissions(
  post: Post,
  userRoles: Role[],
  userId: string,
  isBlockedByAuthor: boolean
): PostPermissions {
  const roleLevel = getHighestRoleLevel(userRoles)
  const isTester = userRoles.includes("TESTER")

  // If user is blocked and has no high-level roles, deny all permissions
  if (isBlockedByAuthor && roleLevel <= 2 && !userRoles.includes("ADMIN")) {
    return {
      view: false,
      create: false,
      delete: false,
      invite: false,
    }
  }

  // Base permissions from highest role level
  const basePermissions = {
    // LEAD_DEVELOPER and ADMIN have all permissions
    view: true,
    create: roleLevel > 0,
    delete: roleLevel >= 5 || post.userId === userId,
    invite: roleLevel >= 5,
  }

  // Additional permissions for role combinations
  return {
    ...basePermissions,
    // Testers can view all content regardless of role level
    view: basePermissions.view || isTester,
    // Moderators can delete any post
    delete: basePermissions.delete || userRoles.includes("MODERATOR"),
  }
}
