import { Permissions, Role, User } from "./types"
import { ROLES } from "./policies"

export class Authorization {
  constructor(private user: User) {}

  hasPermission<Resource extends keyof Permissions>(
    resource: Resource,
    action: Permissions[Resource]["action"],
    data?: Permissions[Resource]["dataType"]
  ): boolean {
    return this.user.roles.some((role) => {
      const permission = ROLES[role][resource]?.[action]
      if (permission == null) return false

      if (typeof permission === "boolean") return permission
      return data != null && permission(this.user, data)
    })
  }

  hasRole(role: Role): boolean {
    return this.user.roles.includes(role)
  }

  hasAnyRole(roles: Role[]): boolean {
    return roles.some((role) => this.hasRole(role))
  }

  getRoles(): Role[] {
    return this.user.roles
  }

  getUser(): User {
    return this.user
  }
}
