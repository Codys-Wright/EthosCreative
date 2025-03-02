import {
  DataTableProps,
  DataTableColumnConfig,
  RendererType,
} from "@/components/crud/data-table";
import {
  // Effect schemas
  Example,
  NewExample,
  // TypeScript types
  type ExampleType,
  type NewExampleType,
  // Tab groups
  ExampleGroups,
} from "../types/example.type";
import { ExampleFields } from "../types/example-fields";

/**********************
 * TABLE COLUMN CONFIGURATION
 **********************/

// Define table columns configuration
export const exampleColumns: DataTableColumnConfig<ExampleType>[] = [
  {
    field: "id",
    header: "ID",
    width: 100,
    rendererType: RendererType.ID,
  },
  {
    field: "title",
    header: "Title",
    width: 200,
    maxTextWidth: 180,
  },
  {
    field: "subtitle",
    header: "Subtitle",
    width: 200,
    maxTextWidth: 180,
  },
  {
    field: "content",
    header: "Content",
    maxTextWidth: 300,
  },
];

// Define the editor key info
export const exampleEditorKeyInfo = {
  title: {
    field: "title",
    label: "Title",
  },
  subtitle: {
    field: "subtitle",
    label: "Subtitle",
  },
  additionalFields: [
    {
      field: "id",
      label: "Example ID",
    },
    {
      field: "createdAt",
      label: "Created At",
    },
  ],
};

/**********************
 * TABLE PROPS CONFIGURATION
 **********************/

/**
 * Props type for an Example management DataTable component.
 * Provides type checking for the DataTable component with Example data.
 */
export type ExampleTableProps = DataTableProps<ExampleType>;

/**
 * Base configuration props for Example DataTable.
 * Contains all the standard configuration that rarely changes and is likely
 * needed for all instances of the Example DataTable.
 */
export const exampleTableBaseProps: Partial<ExampleTableProps> = {
  // Schema and structural configuration
  columns: exampleColumns,
  schema: Example as any,
  createSchema: NewExample as any,
  editSchema: Example as any,
  tabs: ExampleGroups,
  fieldCustomizations: ExampleFields,
  editorKeyInfo: exampleEditorKeyInfo,

  // UI configuration
  title: "Examples",
  description: "Manage examples with inline and dialog editing",
  emptyStateMessage: "No examples found",
  emptyStateDescription: "Create a new example to get started",

  // Feature flags
  useIntegratedEditor: true,
  enableSelection: true,
};

/**
 * Type for runtime/instance specific props.
 * These are the props that vary between different instances of the Example DataTable.
 */
export type ExampleTableRuntimeProps = Pick<
  ExampleTableProps,
  "data" | "onEdit" | "onDelete" | "onCreateNew" | "onFieldUpdate"
> & {
  // Any additional instance-specific props can be defined here
  customTitle?: string;
  readOnly?: boolean;
  editable?: boolean;
};
