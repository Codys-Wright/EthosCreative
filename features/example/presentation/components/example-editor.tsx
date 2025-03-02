"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DataEditorDialog, 
  FieldCustomization,
  TabDefinition
} from "@/components/crud/data-editor-dialog";
import { 
  Example, 
  ExampleGroups,
  NewExample,
  ExampleId
} from "@/features/example/types/example.type";
import { PencilIcon, PlusIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ExampleOperations } from "@/features/example/example.hooks";
import { UseMutationResult } from "@tanstack/react-query";
import { Schema } from "effect";

// Generic type for models with an ID field
type WithId = { id: string | any };

// Props interface for the generic editor
export interface EditorProps<TCreate extends Record<string, any>, TEdit extends Record<string, any>> {
  initialData?: TEdit;
  mode: "create" | "edit";
  title: string;
  description?: string;
  createSchema: ReturnType<typeof Schema.make<TCreate>>;
  editSchema: ReturnType<typeof Schema.make<TEdit>>;
  createTabs: TabDefinition<TCreate>[];
  editTabs: TabDefinition<TEdit>[];
  titleField: keyof (TCreate & TEdit) & string;
  titleLabel: string;
  subtitleField?: keyof (TCreate & TEdit) & string;
  subtitleLabel?: string;
  createFieldCustomizations?: Partial<Record<keyof TCreate & string, FieldCustomization>>;
  editFieldCustomizations?: Partial<Record<keyof TEdit & string, FieldCustomization>>;
  metadataFields?: { field: keyof TEdit & string; label: string; format?: (value: any) => string }[];
  createMutation: {
    mutateAsync: (data: TCreate) => Promise<any>;
    isPending: boolean;
  };
  updateMutation: {
    mutateAsync: (data: TEdit) => Promise<any>;
    isPending: boolean;
  };
}

// Default create tabs for Example type (kept for backwards compatibility)
const defaultCreateTabs: TabDefinition<NewExample>[] = [
  {
    id: "basic",
    label: "Basic Information",
    fields: ["title", "subtitle"],
  },
  {
    id: "content",
    label: "Content",
    fields: ["content"],
  }
];

// Helper function to format date values
function formatDate(date: Date | null | undefined): string {
  if (!date) return "N/A";
  try {
    return new Date(date).toLocaleString();
  } catch (e) {
    return "Invalid Date";
  }
}

// Generic editor component that handles both create and edit modes
export function GenericEditor<
  TCreate extends Record<string, any>,
  TEdit extends Record<string, any>
>({
  initialData,
  mode,
  title,
  description,
  createSchema,
  editSchema,
  createTabs,
  editTabs,
  titleField,
  titleLabel,
  subtitleField,
  subtitleLabel,
  createFieldCustomizations,
  editFieldCustomizations,
  metadataFields,
  createMutation,
  updateMutation,
}: EditorProps<TCreate, TEdit>) {
  // Choose the right schema and tabs based on mode
  const schema = mode === "create" ? createSchema : editSchema;
  const tabs = mode === "create" ? createTabs : editTabs;
  const fieldCustomizations = mode === "create" ? createFieldCustomizations : editFieldCustomizations;
  
  // Handle create/edit submission
  const handleSave = async (data: TCreate | TEdit) => {
    try {
      if (mode === "create") {
        // Create mode - call create mutation with the form data
        await createMutation.mutateAsync(data as TCreate);
        console.log("Successfully created new item");
      } else {
        // Edit mode - call update mutation with the form data
        if (!initialData) {
          console.error("Cannot update without an ID");
          return;
        }
        
        await updateMutation.mutateAsync(data as TEdit);
        console.log("Successfully updated item");
      }
    } catch (error) {
      console.error(`Error ${mode === "create" ? "creating" : "updating"} item:`, error);
    }
  };
  
  // Determine if the operation is loading
  const isLoading = createMutation.isPending || updateMutation.isPending;
  
  // Key information for the data editor dialog
  const keyInfo = {
    title: {
      field: titleField,
      label: titleLabel,
    },
    subtitle: subtitleField && subtitleLabel ? {
      field: subtitleField,
      label: subtitleLabel,
    } : undefined,
    additionalFields: metadataFields && mode === "edit" ? metadataFields : undefined,
  };
  
  return (
    <DataEditorDialog
      title={title}
      description={description}
      data={initialData || {} as TCreate & TEdit}
      onSave={handleSave}
      keyInfo={keyInfo as any} // Type casting to satisfy TypeScript
      schema={schema as any} // Type casting to satisfy TypeScript
      tabs={tabs as any} // Type casting to satisfy TypeScript
      fieldCustomizations={fieldCustomizations as any} // Type casting to satisfy TypeScript
      trigger={
        <Button disabled={isLoading}>
          {isLoading
            ? mode === "create"
              ? "Creating..."
              : "Updating..."
            : mode === "create"
            ? "Create New"
            : "Edit"}
        </Button>
      }
    />
  );
}

// Legacy ExampleEditor component that uses the generic editor
export function ExampleEditor({ 
  edit
}: {
  edit?: Example;
}) {
  // Get mutation hooks from ExampleOperations
  const createMutation = ExampleOperations.useCreate();
  const updateMutation = ExampleOperations.useUpdate();
  
  // Determine mode based on whether edit object is provided
  const mode = edit ? "edit" : "create";
  
  // Create default data for new example
  const defaultNewExample: NewExample = {
    title: null,
    subtitle: null,
    content: null,
  };
  
  // Field customizations for create mode
  const createFieldCustomizations: Partial<Record<keyof NewExample, FieldCustomization>> = {
    title: {
      label: "Example Title",
      description: "The main title of the example",
      placeholder: "Enter a descriptive title..."
    },
    subtitle: {
      label: "Example Subtitle",
      description: "A short description or subtitle",
      placeholder: "Brief description of this example..."
    },
    content: {
      type: "textarea",
      description: "The main content of the example",
      placeholder: "Enter the detailed content here...",
    }
  };
  
  // Field customizations for edit mode
  const editFieldCustomizations: Partial<Record<keyof Example, FieldCustomization>> = {
    id: {
      readonly: true,
      description: "Unique identifier for this example"
    },
    title: {
      label: "Example Title",
      description: "The main title of the example",
      placeholder: "Enter a descriptive title..."
    },
    subtitle: {
      label: "Example Subtitle",
      description: "A short description or subtitle",
      placeholder: "Brief description of this example..."
    },
    content: {
      type: "textarea",
      description: "The main content of the example",
      placeholder: "Enter the detailed content here...",
    },
    createdAt: {
      readonly: true,
      label: "Created",
      description: "When this example was first created"
    },
    updatedAt: {
      readonly: true,
      label: "Last Updated",
      description: "When this example was last modified"
    },
    deletedAt: {
      readonly: true,
      hidden: true,
      label: "Deleted",
      description: "When this example was deleted (if applicable)"
    }
  };
  
  // Metadata fields for the sidebar
  const metadataFields = [
    {
      field: "id" as keyof Example & string,
      label: "ID",
    },
    {
      field: "createdAt" as keyof Example & string,
      label: "Created",
    },
    {
      field: "updatedAt" as keyof Example & string,
      label: "Last Updated",
    }
  ];
  
  // Create wrapper functions for the mutations to handle the type mismatches
  const handleCreate = async (data: NewExample) => {
    return createMutation.mutateAsync(data);
  };
  
  const handleUpdate = async (data: Example) => {
    // Extract id and data for the update mutation
    const { id, ...updateData } = data;
    return updateMutation.mutateAsync({ 
      id: id.toString(), 
      data: updateData as Partial<NewExample>
    });
  };
  
  return (
    <GenericEditor<NewExample, Example>
      initialData={edit}
      mode={mode}
      title={mode === "create" ? "Create New Example" : "Edit Example"}
      description={mode === "create" ? "Create a new example by filling out the fields below." : "Edit the example details using the tabs below."}
      createSchema={NewExample as any}
      editSchema={Example as any}
      createTabs={defaultCreateTabs}
      editTabs={ExampleGroups as unknown as TabDefinition<Example>[]}
      titleField="title"
      titleLabel="Title"
      subtitleField="subtitle"
      subtitleLabel="Description"
      createFieldCustomizations={createFieldCustomizations}
      editFieldCustomizations={editFieldCustomizations}
      metadataFields={metadataFields}
      createMutation={{
        mutateAsync: handleCreate,
        isPending: createMutation.isPending
      }}
      updateMutation={{
        mutateAsync: handleUpdate,
        isPending: updateMutation.isPending
      }}
    />
  );
}
