import { DataTableProps, DataTableColumnConfig, RendererType } from "@/components/crud/data-table";
import { User, NewUser, UserSchema, NewUserSchema } from "./User.type";
import { UserTabGroups, userFieldCustomizations } from "./user-fields";
import { generateUserId, sampleUsers } from "./generateUserData";

/**********************
 * TABLE COLUMN CONFIGURATION
 **********************/

// Define table columns configuration
export const userColumns: DataTableColumnConfig<User>[] = [
  {
    field: "id",
    header: "ID",
    width: 100,
    rendererType: RendererType.ID,
  },
  {
    field: "name",
    header: "Name",
  },
  {
    field: "email",
    header: "Email",
  },
  {
    field: "status",
    header: "Status",
    rendererType: RendererType.STATUS,
    width: 120,
    align: 'center',
  },
  {
    field: "role",
    header: "Role",
    rendererType: RendererType.ROLE,
    width: 120,
    align: 'center',
  },
  {
    field: "lastLogin",
    header: "Last Login",
    rendererType: RendererType.DATE,
    width: 150,
    align: 'center',
  },
  {
    field: "subscribed",
    header: "Subscribed",
    rendererType: RendererType.BOOLEAN,
    width: 120,
    align: 'center',
  },
];

// Define the editor key info
export const userEditorKeyInfo = {
  title: {
    field: "name",
    label: "User Name"
  },
  subtitle: {
    field: "email",
    label: "Email Address"
  },
  additionalFields: [
    {
      field: "id",
      label: "User ID"
    },
    {
      field: "createdAt",
      label: "Created At"
    }
  ]
};

// Re-export the ID generator for convenience
export { generateUserId };

/**********************
 * TABLE PROPS CONFIGURATION
 **********************/

/**
 * Props type for a User management DataTable component.
 * Provides type checking for the DataTable component with User data.
 */
export type UserTableProps = DataTableProps<User>;

/**
 * Base configuration props for User DataTable.
 * Contains all the standard configuration that rarely changes and is likely 
 * needed for all instances of the User DataTable.
 */
export const userTableBaseProps: Partial<UserTableProps> = {
  // Schema and structural configuration
  columns: userColumns,
  schema: UserSchema,
  createSchema: NewUserSchema,
  editSchema: UserSchema,
  tabs: UserTabGroups,
  fieldCustomizations: userFieldCustomizations,
  editorKeyInfo: userEditorKeyInfo,
  
  // UI configuration
  title: "Users",
  description: "Manage user accounts with inline and dialog editing",
  emptyStateMessage: "No users found",
  emptyStateDescription: "Create a new user to get started",
  
  // Feature flags
  useIntegratedEditor: true,
  enableSelection: true,
};

/**
 * Type for runtime/instance specific props.
 * These are the props that vary between different instances of the User DataTable.
 */
export type UserTableRuntimeProps = Pick<UserTableProps, 
  'data' | 
  'onEdit' | 
  'onDelete' | 
  'onCreateNew' | 
  'onFieldUpdate'
> & {
  // Any additional instance-specific props can be defined here
  customTitle?: string;
  readOnly?: boolean;
  editable?: boolean;
}; 