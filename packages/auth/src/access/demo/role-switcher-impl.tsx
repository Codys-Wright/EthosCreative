"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Settings2 } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Role } from "../types"
import { useAccessControl } from "../useAccessControl"
import { Skeleton } from "@/components/ui/skeleton"

// All available roles
const AVAILABLE_ROLES: Role[] = [
  "LEAD_DEVELOPER",
  "DEVELOPER",
  "ADMIN",
  "SUPPORT",
  "MODERATOR",
  "USER",
  "GUEST",
]

export function RoleSwitcherImpl() {
  const { roles, setRole } = useAccessControl()
  const currentRole = roles.get()

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Settings2 className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Role Switcher</h4>
              <p className="text-sm text-muted-foreground">
                Change your role to test different permissions
              </p>
            </div>
            <div className="grid gap-2">
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                {roles.isLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={currentRole}
                    onValueChange={(value: Role) => {
                      setRole(value)
                    }}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_ROLES.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 