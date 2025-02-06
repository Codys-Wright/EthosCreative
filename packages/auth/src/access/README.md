# Role-Based Access Control System

A lightweight and flexible role-based access control (RBAC) system with attribute-based access control (ABAC) features. Supports multiple roles per user for flexible permission combinations.

## Roles

Users can have multiple roles, combining different access levels:

```typescript
type Role =
  | "LEAD_DEVELOPER" // Level 7
  | "DEVELOPER" // Level 6
  | "ADMIN" // Level 5
  | "SUPPORT" // Level 4
  | "MODERATOR" // Level 3
  | "TESTER" // Level 2 (Beta features access)
  | "USER" // Level 1
  | "GUEST" // Level 0
```

## Usage

### 1. Check User Roles

```typescript
import { useAccessControl } from "./useAccessControl"

function MyComponent() {
  const { roles } = useAccessControl()

  // Check if user has a specific role
  if (roles.has("ADMIN")) {
    // Show admin content
  }

  // Check if user has beta access
  if (roles.has("TESTER")) {
    // Show beta features
  }

  // Get all user roles
  const userRoles = roles.get() // e.g., ["ADMIN", "TESTER"]
}
```

### 2. Role Combinations

```typescript
import { hasRole, hasAnyRole, hasAllRoles } from "./types"

// Check for single role
if (hasRole(userRoles, "ADMIN")) {
  // User is an admin
}

// Check if user has any of these roles
if (hasAnyRole(userRoles, ["ADMIN", "MODERATOR"])) {
  // User can moderate content
}

// Check if user has all roles
if (hasAllRoles(userRoles, ["ADMIN", "TESTER"])) {
  // User is an admin with beta access
}
```

### 3. Permission Rules

```typescript
// Permission logic considers role combinations
const permissions = getPostPermissions(post, userRoles, userId, isBlocked)

// Example: Admin + Tester
{
  view: true,      // From Admin role
  create: true,    // From Admin role
  delete: true,    // From Admin role
  invite: true,    // From Admin role
  beta: true       // From Tester role
}

// Example: User + Tester
{
  view: true,      // Basic access + Beta content
  create: true,    // Basic user permission
  delete: false,   // No admin/mod rights
  invite: false,   // No admin rights
  beta: true       // Tester access
}
```

## Permission Logic

1. **Role Hierarchy**: Permissions are based on the highest role level
2. **Role Combinations**: Additional permissions from each role are combined
3. **Special Cases**:
   - **TESTER**: Always has access to beta features regardless of other roles
   - **ADMIN**: Full system access
   - **MODERATOR**: Content moderation permissions
   - **Blocked Users**: Access denied unless they have high-level roles

## Implementation

1. **Role Storage**: Multiple roles stored in localStorage
2. **Access Control Hook**: `useAccessControl` provides role checking methods
3. **Helper Functions**:
   - `hasRole`: Check for single role
   - `hasAnyRole`: Check for any of multiple roles
   - `hasAllRoles`: Check for all specified roles
4. **Type Safety**: Full TypeScript support for role combinations
