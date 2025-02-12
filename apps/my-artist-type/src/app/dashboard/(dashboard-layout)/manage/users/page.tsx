"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
} from "@repo/ui";
import { IconSearch, IconUserPlus } from "@tabler/icons-react";

export default function UsersPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Not Implemented </CardTitle>
          </CardHeader>
        </Card>
      </div>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Input placeholder="Search users..." />
            <IconSearch className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          <Button>
            <IconUserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View and manage user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* User List Header */}
            <div className="grid grid-cols-5 gap-4 border-b pb-2 text-sm font-medium text-muted-foreground">
              <div>Name</div>
              <div>Email</div>
              <div>Role</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>

            {/* User List Items */}
            <div className="space-y-4">
              {/* User 1 */}
              <div className="grid grid-cols-5 items-center gap-4">
                <div className="font-medium">John Doe</div>
                <div className="text-muted-foreground">john@example.com</div>
                <div>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                    Admin
                  </span>
                </div>
                <div>
                  <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-500">
                    Active
                  </span>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm">
                    Delete
                  </Button>
                </div>
              </div>

              {/* User 2 */}
              <div className="grid grid-cols-5 items-center gap-4">
                <div className="font-medium">Jane Smith</div>
                <div className="text-muted-foreground">jane@example.com</div>
                <div>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                    User
                  </span>
                </div>
                <div>
                  <span className="rounded-full bg-green-500/10 px-2 py-1 text-xs text-green-500">
                    Active
                  </span>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm">
                    Delete
                  </Button>
                </div>
              </div>

              {/* User 3 */}
              <div className="grid grid-cols-5 items-center gap-4">
                <div className="font-medium">Alex Johnson</div>
                <div className="text-muted-foreground">alex@example.com</div>
                <div>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                    User
                  </span>
                </div>
                <div>
                  <span className="rounded-full bg-yellow-500/10 px-2 py-1 text-xs text-yellow-500">
                    Pending
                  </span>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm">
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
