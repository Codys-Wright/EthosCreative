"use client"

import { getMockPosts } from "./mock-posts"
import { PostCard } from "./post-card"
import { useAccessControl } from "../useAccessControl"

export function PostsGrid() {
  const { user } = useAccessControl()
  const currentUserId = user.data?.id ?? "guest"
  const posts = getMockPosts(currentUserId)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {posts.map((post) => (
        <div key={post.id} className="col-span-1">
          <PostCard post={post} />
        </div>
      ))}
    </div>
  )
}
