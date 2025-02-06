"use client"

import { Badge } from "@/components/ui/badge"
import { useAccessControl } from "@/features/global/roles-permissions/useAccessControl"
import { Role } from "@/features/global/roles-permissions/types"

const ROLE_COLORS: Record<Role, string> = {
  LEAD_DEVELOPER: "bg-indigo-100 text-indigo-800 hover:bg-indigo-100",
  DEVELOPER: "bg-cyan-100 text-cyan-800 hover:bg-cyan-100",
  ADMIN: "bg-red-100 text-red-800 hover:bg-red-100",
  SUPPORT: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100",
  MODERATOR: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  TESTER: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  USER: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  GUEST: "bg-gray-100 text-gray-800 hover:bg-gray-100",
}

const ACCESS_LEVELS: Record<Role, string> = {
  LEAD_DEVELOPER: "System-wide Technical Access",
  DEVELOPER: "Technical Access",
  ADMIN: "Full Administrative Access",
  SUPPORT: "Customer Support Access",
  MODERATOR: "Content Moderation Access",
  TESTER: "Beta Testing Access",
  USER: "Standard Access",
  GUEST: "Limited Access",
}

export function RoleDisplay() {
  const { roles } = useAccessControl()
  const currentRole: Role = roles.get() ?? "GUEST"
  const isTester = roles.isTester ?? false

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="font-medium">Role:</span>
        <Badge variant="secondary" className={ROLE_COLORS[currentRole]}>
          {currentRole.replace("_", " ")}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-medium">Access Level:</span>
        <span>{ACCESS_LEVELS[currentRole]}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-medium">Beta Access:</span>
        <Badge
          variant="secondary"
          className={
            isTester
              ? "bg-purple-100 text-purple-800"
              : "bg-gray-100 text-gray-500"
          }
        >
          {isTester ? "Enabled" : "Disabled"}
        </Badge>
      </div>
    </div>
  )
}
