import { FieldCustomizationRecord } from "@/components/crud/field-types";
import { TabDefinition } from "@/components/crud/data-editor-dialog";
import type { User, NewUser } from "./User.type";

// Define tab groups for users (used for both editing and creating)
export const UserTabGroups: TabDefinition<User>[] = [
  {
    id: "details",
    label: "User Details",
    fields: ["name", "email", "status", "role"]
  },
  {
    id: "preferences",
    label: "Preferences",
    fields: ["subscribed", "notes"]
  },
  {
    id: "metadata",
    label: "Metadata",
    fields: ["id", "createdAt", "lastLogin"]
  }
];

// Define field customizations for the User type
export const userFieldCustomizations: FieldCustomizationRecord<User> = {
  status: {
    type: "select",
    options: [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Pending", value: "pending" }
    ],
    label: "User Status",
    description: "Current status of the user account"
  },
  role: {
    type: "select",
    options: [
      { label: "Administrator", value: "admin" },
      { label: "Regular User", value: "user" },
      { label: "Content Editor", value: "editor" }
    ],
    label: "User Role",
    description: "Access level and permissions"
  },
  notes: {
    type: "textarea",
    label: "Additional Notes",
    description: "Optional notes about this user",
    placeholder: "Add notes about this user..."
  },
  name: {
    label: "Full Name",
    placeholder: "Enter user's full name",
    description: "User's full name (first and last name)"
  },
  email: {
    type: "email",
    label: "Email Address",
    placeholder: "user@example.com",
    description: "User's primary email address for communications"
  },
  subscribed: {
    type: "checkbox",
    label: "Email Subscription",
    description: "Whether the user is subscribed to email notifications"
  },
  id: {
    readOnly: true,
    label: "User ID",
    description: "Unique identifier for this user (cannot be changed)"
  },
  createdAt: {
    readOnly: true,
    label: "Created Date",
    description: "When this user account was created"
  },
  lastLogin: {
    readOnly: true,
    label: "Last Login",
    description: "When this user last logged in"
  }
};

// Note: We no longer need separate field customizations for NewUser
// The system will automatically detect which fields should be auto-generated
// based on the differences between User and NewUser types 