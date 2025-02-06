"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Role } from "../types"
import { getUserById, updateUserRoles } from "@/RefactorLater/actions/UserActions"

// Cache key for user roles - keep this consistent across the app
export const USER_ROLES_KEY = (userId: string) => ["user-roles", userId] as const

// Function to fetch user role from the database using server action
async function fetchUserRole(userId: string): Promise<{ role: Role }> {
  console.log("Fetching role for user:", userId)
  const user = await getUserById(userId)
  console.log("Database response:", user)
  
  if (!user) {
    console.log("User not found in database")
    throw new Error('User not found')
  }
  
  // Ensure roles is an array and has at least one role
  const roles = Array.isArray(user.roles) ? user.roles : []
  const role = roles.length > 0 ? (roles[0] as Role) : "GUEST"
  
  console.log("Resolved role:", role)
  return { role }
}

// Function to update user role in the database using server action
async function updateUserRole(userId: string, role: Role): Promise<void> {
  console.log("Updating role:", { userId, role })
  await updateUserRoles(userId, [role])
  console.log("Role update complete")
}

// Hook to fetch and cache user role
export function useUserRole(userId: string) {
  const enabled = !!userId && userId !== "guest"
  console.log("useUserRole hook:", { userId, enabled })
  
  return useQuery({
    queryKey: USER_ROLES_KEY(userId),
    queryFn: () => fetchUserRole(userId),
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    enabled, // Only fetch if we have a valid user ID
  })
}

// Hook to update user role
export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) => 
      updateUserRole(userId, role),
    onSuccess: (_, { userId }) => {
      console.log("Role update successful, invalidating queries")
      // Invalidate and refetch the user role query
      queryClient.invalidateQueries({ queryKey: USER_ROLES_KEY(userId) })
    },
  })
}
