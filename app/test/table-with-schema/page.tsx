"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, NewUser } from "./components/User.type";
import { 
  userFieldCustomizations,
  UserTabGroups
} from "./components/user-fields";
import { DataTable, DataTableProps } from "@/components/crud/data-table";
import { 
  UserTableProps,
  userTableBaseProps,
  UserTableRuntimeProps,
  userColumns,
  userEditorKeyInfo,
  generateUserId
} from "./components/user-table";
import { generateUsers } from "./components/generateUserData";

export default function TableWithSchemaPage() {
  // Initialize with empty array to prevent hydration mismatches
  const [users, setUsers] = useState<User[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  // Track if component is mounted on client
  const [isMounted, setIsMounted] = useState(false);
  
  // Initialize data only on the client side to prevent hydration mismatches
  useEffect(() => {
    // Generate 50 random users
    setUsers(generateUsers(50));
    setIsMounted(true);
  }, []);

  // User Service Functions (in a real app, these would be in a separate service file)

  // Handler for updating a user (from inline editing)
  const updateUser = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === updatedUser.id ? updatedUser : user)),
    );
    return true;
  };

  // Field update handler for inline editing
  const handleFieldUpdate = async (row: User, field: keyof User, value: any): Promise<boolean> => {
    try {
      // Update the user with the new field value
      const updatedUser = { ...row, [field]: value };
      return updateUser(updatedUser);
    } catch (error) {
      console.error("Error updating field:", error);
      return false;
    }
  };

  // Handler for saving a user (from dialog)
  const saveUser = (userData: User | NewUser): void => {
    if ("id" in userData && typeof userData.id === "string") {
      // Update existing user - validate is handled by the form
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userData.id ? (userData as User) : user
        ),
      );
    } else {
      // Create new user with generated ID and consistent timestamps
      // Use a function wrapped in useState to avoid hydration mismatches
      setUsers((prev) => {
        const newUser: User = {
          ...(userData as NewUser),
          id: generateUserId(),
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        };
        return [...prev, newUser];
      });
    }
  };

  // Handler for deleting a user
  const deleteUser = async (user: User) => {
    // In a real app, you would make an API call here
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    return true;
  };

  // Handler for initiating user creation
  const createUser = () => {
    setIsCreating(true);
  };

  // Define the runtime props that are specific to this instance
  const runtimeProps: UserTableRuntimeProps = {
    data: users,
    onEdit: saveUser,
    onDelete: deleteUser,
    onCreateNew: createUser,
    onFieldUpdate: handleFieldUpdate,
    // Add editable to runtime props
    editable: true,
    // Add any runtime customizations here
    // customTitle: "Custom User List",
    // readOnly: false,
  };

  // Compose the complete props for this instance
  const tableProps = {
    ...userTableBaseProps,  // Use the base configuration
    ...runtimeProps,        // Override with runtime values
    
    // Override any base props as needed for this specific instance
    // For example:
    // title: runtimeProps.customTitle || userTableBaseProps.title,
  } as DataTableProps<User>;

  return (
    <div className="flex flex-col items-center min-h-screen bg-background py-10">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-8">
        <Card className="w-full shadow-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Data Table with Schema Validation
            </CardTitle>
            <CardDescription className="max-w-3xl mx-auto">
              Demonstrating shared field customizations between inline editing
              and dialog editing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-6 text-center max-w-3xl mx-auto">
              This example shows how to use the same field customizations for
              both inline table editing and dialog-based editing.
            </p>
          </CardContent>
        </Card>

        {/* User management section with composed props */}
        <div className="w-full">
          {isMounted ? (
            <DataTable {...tableProps} />
          ) : (
            <div className="flex justify-center p-8">
              <p>Loading...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

