"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAccessControl } from "../useAccessControl"
import { Post } from "./mock-posts"
import { getPostPermissions } from "./post-permissions"
import { getMockUsers } from "./mock-posts"
import { Badge } from "@/components/ui/badge"
import { Role } from "../types"

interface PostCardProps {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const { user, roles } = useAccessControl()
  const userRoles = roles.get()
  const currentRoles: Role[] = Array.isArray(userRoles)
    ? userRoles
    : [userRoles]
  const currentUserId = user.data?.id ?? "guest"

  // Get mock users with current user's ID
  const mockUsers = getMockUsers(currentUserId)

  // Find the post author
  const author = mockUsers.find((u) => u.id === post.userId)
  const isBlockedByAuthor = author?.blockedBy?.includes(currentUserId) ?? false

  const permissions = getPostPermissions(
    post,
    currentRoles,
    currentUserId,
    isBlockedByAuthor
  )

  if (!permissions.view) {
    return (
      <Card className="bg-gray-50">
        <CardHeader className="py-3">
          <CardTitle className="text-red-500 text-sm">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="pb-3">
          <p className="text-xs text-gray-500">Blocked by author</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center justify-between">
          {post.title}
          <Badge variant="secondary" className="text-xs">
            {post.userId === currentUserId ? "you" : post.userId}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3 space-y-2">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">View:</span>
            <span
              className={permissions.view ? "text-green-600" : "text-red-500"}
            >
              {permissions.view.toString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Create:</span>
            <span
              className={permissions.create ? "text-green-600" : "text-red-500"}
            >
              {permissions.create.toString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Delete:</span>
            <span
              className={permissions.delete ? "text-green-600" : "text-red-500"}
            >
              {permissions.delete.toString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Invite:</span>
            <span
              className={permissions.invite ? "text-green-600" : "text-red-500"}
            >
              {permissions.invite.toString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
