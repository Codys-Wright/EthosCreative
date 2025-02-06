"use client"

import { Card } from "@/components/ui/card"
import { useAccessControl } from "@/features/global/roles-permissions/useAccessControl"

const ROLE_CARDS = {
  LEAD_DEVELOPER: {
    title: "Lead Developer Dashboard",
    description:
      "System-wide access to all technical resources and configurations.",
    className: "bg-indigo-50 border-indigo-200",
  },
  DEVELOPER: {
    title: "Developer Tools",
    description: "Access to development environments and code repositories.",
    className: "bg-cyan-50 border-cyan-200",
  },
  ADMIN: {
    title: "Admin Control Panel",
    description: "Manage users, permissions, and system settings.",
    className: "bg-red-50 border-red-200",
  },
  SUPPORT: {
    title: "Support Dashboard",
    description: "Customer support tools and ticket management.",
    className: "bg-emerald-50 border-emerald-200",
  },
  MODERATOR: {
    title: "Moderation Tools",
    description: "Content moderation and community management.",
    className: "bg-orange-50 border-orange-200",
  },
  TESTER: {
    title: "Testing Environment",
    description: "QA tools and test case management.",
    className: "bg-purple-50 border-purple-200",
  },
  USER: {
    title: "User Dashboard",
    description: "Your personal workspace and settings.",
    className: "bg-blue-50 border-blue-200",
  },
  GUEST: {
    title: "Welcome",
    description: "Limited access to public resources.",
    className: "bg-gray-50 border-gray-200",
  },
} as const

export function RoleCards() {
  const { roles } = useAccessControl()
  const userRoles = roles.get()

  return (
    <div className="grid gap-6">
      {userRoles.map((role) => {
        const card = ROLE_CARDS[role]
        return (
          <Card
            key={role}
            className={`p-6 transition-all duration-300 ${card.className}`}
          >
            <h2 className="text-xl font-semibold mb-2">{card.title}</h2>
            <p className="text-gray-600">{card.description}</p>
          </Card>
        )
      })}
    </div>
  )
}
