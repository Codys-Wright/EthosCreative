"use client"

import { useQuery } from "@tanstack/react-query"
import { Role } from "../types"
import { useUpdateUserRole } from "./use-role-mutation"
import { getUserById } from "@/RefactorLater/actions/UserActions"
import { UserEntity } from "@/RefactorLater/entities/UserEntity"
import { authClient } from "./../../auth-client"
import { betterAuth } from "better-auth"
import { auth } from "@/auth"

await auth.api.getSession({
  headers: new Headers({
    email: "",
    roles: ""
  }),
  asResponse: true,
})




// Cache key for user data
const USER_QUERY_KEY = ["user-data"] as const

// Helper to safely convert JsonValue to Role array

function parseRoles(roles: unknown): Role[] {
  if (Array.isArray(roles)) {
    return roles.filter((role): role is Role => 
      typeof role === "string" && 
      ["LEAD_DEVELOPER", "DEVELOPER", "ADMIN", "SUPPORT", "MODERATOR", "USER", "GUEST"].includes(role)
    )
  }
  return ["GUEST"]
}

export function useAccessControl() {
  // Get the current user from the database
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: async () => {
      try {
        const user = await getUserById("me")
        return user || { id: "guest", roles: ["GUEST"] }
      } catch (error) {
        return { id: "guest", roles: ["GUEST"] }
      }
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  })

  const { mutate: updateRole } = useUpdateUserRole()

  // Parse roles from the database response
  const userRoles = parseRoles(userData?.roles)

  const roles = {
    get: () => userRoles[0] || "GUEST",
    has: (role: Role) => userRoles.includes(role),
    isLoading: isUserLoading,
  }

  const hasAnyRole = (requiredRoles: Role[]) => {
    return requiredRoles.some((role) => userRoles.includes(role))
  }

  return {
    user: { 
      data: userData as UserEntity,
      isAuthenticated: !!userData?.id && userData.id !== "guest",
      isLoading: isUserLoading,
    },
    roles,
    hasAnyRole,
    setRole: (role: Role) => {
      if (userData?.id && userData.id !== "guest") {
        updateRole({ userId: userData.id, role })
      }
    },
  }
}
