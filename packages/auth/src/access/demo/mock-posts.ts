import { User } from "../types"

export interface Post {
  id: string
  userId: string
  title: string
  content: string
  createdAt: string
}

export function getMockUsers(currentUserId: string): User[] {
  return [
    { id: currentUserId, roles: ["USER"], blockedBy: [] },
    { id: "user-2", roles: ["USER"], blockedBy: [] },
    { id: "user-3", roles: ["USER"], blockedBy: [] },
    { id: "user-4", roles: ["USER"], blockedBy: [currentUserId] },
  ]
}

export function getMockPosts(currentUserId: string): Post[] {
  return [
    {
      id: "post-1",
      userId: currentUserId,
      title: "My First Post",
      content: "This is my post",
      createdAt: "2024-01-01",
    },
    {
      id: "post-2",
      userId: "user-2",
      title: "Hello from User 2",
      content: "This is a post by User 2",
      createdAt: "2024-01-02",
    },
    {
      id: "post-3",
      userId: "user-3",
      title: "User 3's Post",
      content: "This is a post by User 3",
      createdAt: "2024-01-03",
    },
    {
      id: "post-4",
      userId: "user-4",
      title: "User 4's Post",
      content: "This is a post by User 4 (who blocked you)",
      createdAt: "2024-01-04",
    },
  ]
}
