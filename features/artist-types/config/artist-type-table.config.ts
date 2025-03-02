import {
  DataTableProps,
  DataTableColumnConfig,
  RendererType,
  schemaFor,
} from "@/components/crud/data-table";
import {
  // Effect schemas
  ArtistType,
  NewArtistType,
  // TypeScript types
  type ArtistTypeType,
  type NewArtistTypeType,
  // Tab groups
  ArtistTypeGroups,
} from "../types/artist-type.type";
import { ArtistTypeFields } from "../types/artist-fields";
import { Schema } from "effect";

/**********************
 * TABLE COLUMN CONFIGURATION
 **********************/

/**
 * Column configuration for the artist type data table
 */
export const columns: DataTableColumnConfig<ArtistTypeType>[] = [
  {
    field: "id",
    header: "ID",
    rendererType: RendererType.ID,
    width: 200,
    sortable: true,
    searchable: false,
  },
  {
    field: "title",
    header: "Title",
    sortable: true,
    searchable: true,
    width: 200,
  },
  {
    field: "subtitle",
    header: "Subtitle",
    sortable: true,
    searchable: true,
    width: 200,
  },
  {
    field: "elevatorPitch",
    header: "Elevator Pitch",
    sortable: true,
    searchable: true,
    width: 300,
    maxTextWidth: 300,
  },
  {
    field: "tags",
    header: "Tags",
    sortable: false,
    searchable: true,
    width: 200,
    renderer: ({ value }) => {
      if (!value || !Array.isArray(value)) return null;
      
      // Display first 3 tags with a count of remaining ones
      const displayTags = value.slice(0, 3).join(", ");
      const extraCount = value.length > 3 ? ` +${value.length - 3} more` : '';
      
      return displayTags + extraCount;
    },
  },
  {
    field: "version",
    header: "Version",
    sortable: true,
    searchable: false,
    width: 100,
    align: "center",
  },
  {
    field: "createdAt",
    header: "Created",
    rendererType: RendererType.DATE,
    sortable: true,
    searchable: false,
    width: 180,
  },
  {
    field: "updatedAt",
    header: "Updated",
    rendererType: RendererType.DATE,
    sortable: true,
    searchable: false,
    width: 180,
  },
];

// Define the editor key info for artist types
export const artistTypeEditorKeyInfo = {
  title: {
    field: "title",
    label: "Title"
  },
  subtitle: {
    field: "subtitle",
    label: "Subtitle"
  },
  additionalFields: [
    {
      field: "elevatorPitch",
      label: "Elevator Pitch"
    }
  ]
};

/**********************
 * TABLE PROPS CONFIGURATION
 **********************/

/**
 * Export the table configuration object
 */
export const artistTypeTableConfig = {
  columns,
  editorKeyInfo: artistTypeEditorKeyInfo,
  // Use the schemaFor helper to ensure proper typing while preserving schema structure
  schema: schemaFor<ArtistTypeType>(ArtistType),
  createSchema: schemaFor<NewArtistTypeType>(NewArtistType),
  editSchema: schemaFor<ArtistTypeType>(ArtistType),
  tabs: ArtistTypeGroups,
  fieldCustomizations: ArtistTypeFields,
};

/**
 * Type definition for the Artist Type table props 
 */
export type ArtistTypeTableProps = DataTableProps<ArtistTypeType>;

/**
 * Type for runtime/instance specific props.
 * These are the props that vary between different instances of the ArtistType DataTable.
 */
export type ArtistTypeTableRuntimeProps = Pick<
  ArtistTypeTableProps,
  "data" | "onEdit" | "onDelete" | "onCreateNew" | "onFieldUpdate"
> & {
  // Any additional instance-specific props can be defined here
  customTitle?: string;
  readOnly?: boolean;
  editable?: boolean;
};

/**
 * Base props for all Artist Type tables
 * These props remain consistent across all instances of the ArtistType DataTable
 */
export const artistTypeTableBaseProps: Partial<ArtistTypeTableProps> = {
  columns,
  title: "Artist Types",
  description: "Manage artist type definitions",
  tabs: ArtistTypeGroups,
  fieldCustomizations: ArtistTypeFields,
  editorKeyInfo: artistTypeEditorKeyInfo,
  // Use the schemaFor helper to ensure proper typing while preserving schema structure
  schema: schemaFor<ArtistTypeType>(ArtistType),
  createSchema: schemaFor<NewArtistTypeType>(NewArtistType),
  editSchema: schemaFor<ArtistTypeType>(ArtistType),
  
  // UI configuration
  emptyStateMessage: "No artist types found",
  emptyStateDescription: "Create your first artist type to get started",
  
  // Feature flags
  useIntegratedEditor: true,
  enableSelection: true,
}; 