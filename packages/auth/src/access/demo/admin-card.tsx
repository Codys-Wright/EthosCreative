"use client"

import { Card } from "@/components/ui/card"
import { useAuthorization } from "@/features/global/roles-permissions/useAuthorization"

export function AdminCard() {
  const { hasRole } = useAuthorization()

  if (!hasRole("ADMIN")) {
    return null
  }

  return (
    <Card className="p-6 bg-yellow-50">
      <h2 className="text-xl font-semibold mb-4">Admin Access</h2>
      <p className="text-gray-600">
        You have administrative privileges. You can manage all resources and
        user permissions.
      </p>
    </Card>
  )
}
