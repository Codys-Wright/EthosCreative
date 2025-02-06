"use client"

import { Button } from "@/components/ui/button"
import { useAccessControl } from "@/features/global/roles-permissions/useAccessControl"

export function AdminButton() {
  const { roles } = useAccessControl()

  if (!roles.has("ADMIN")) {
    return null
  }

  return (
    <Button variant="default" onClick={() => console.log("I'm an admin")}>
      Admin Action
    </Button>
  )
}
