"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  DataEditorDialog,
  FieldCustomization,
} from "@/components/crud/data-editor-dialog";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogDemo } from "./dialogDemo";
import { ExampleEditor } from "@/features/example/presentation/components/example-editor";
import { 
  Example, 
  ExampleId, 
  NewExample, 
  ExampleGroups 
} from "@/features/example/types/example.type";
import { format } from "date-fns";

// Helper function to safely format dates
const formatDate = (date: Date | null | undefined): string => {
  if (!date) return "N/A";
  try {
    return format(date instanceof Date ? date : new Date(date), "PPP p"); // e.g., "Apr 29, 2023 at 3:45 PM"
  } catch (e) {
    return String(date);
  }
};

// Create a properly typed example object for demonstration
const exampleData: Example = {
  id: "example-123" as unknown as string & typeof ExampleId.Type,
  title: "Example Title",
  subtitle: "This is a subtitle",
  content: "This is a longer content field that would work well in a textarea.",
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

export default function TestEditPage() {
  // Handler for when form is saved
  const handleSave = (data: Example) => {
    console.log("Form saved with data:", data);
    alert("Data saved! Check console for details.");
  };

  // Field customizations for the DataEditorDialog example
  const fieldCustomizations: Record<string, FieldCustomization> = {
    content: {
      type: "textarea",
      description: "The main content for this example",
      placeholder: "Enter detailed content here...",
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
    id: {
      description: "Unique identifier (read-only)",
      readonly: true,
    },
    createdAt: {
      label: "Created Date",
      description: "When this item was created (read-only)",
      type: "date",
      readonly: true,
    },
    updatedAt: {
      label: "Last Updated",
      description: "When this item was last updated (read-only)",
      type: "date",
      readonly: true,
    },
    deletedAt: {
      label: "Deleted Date",
      description: "When this item was deleted (if applicable)",
      type: "date",
      readonly: true,
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Data Editor Dialog Example</h1>
      <p className="mb-8 text-muted-foreground">
        This example demonstrates a form automatically generated from an Effect
        TS schema.
      </p>

      <div className="flex flex-col gap-4 max-w-md">
        <DataEditorDialog
          title="Edit Example"
          description="Edit the fields of this example. Some fields like ID, Created Date, and Last Updated are read-only."
          data={exampleData}
          onSave={handleSave}
          schema={Example as any}
          keyInfo={{
            title: { field: "title", label: "Title" },
            subtitle: { field: "subtitle", label: "Subtitle" },
            additionalFields: [
              { 
                field: "createdAt", 
                label: "Created",
              },
              { 
                field: "updatedAt", 
                label: "Updated",
              },
            ],
          }}
          tabs={ExampleGroups}
          fieldCustomizations={fieldCustomizations}
          trigger={<Button>Open Editor</Button>}
        />

        <div className="mt-8 p-4 border rounded-lg bg-muted/30">
          <h2 className="font-semibold mb-2">How It Works</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>
              The form fields are automatically generated from the Effect TS
              schema
            </li>
            <li>
              Field types are inferred from the schema (text, number, boolean,
              etc.)
            </li>
            <li>Fields are organized into tabs for better navigation</li>
            <li>
              Field appearance can be customized with the fieldCustomizations
              prop
            </li>
            <li>Some fields are set as read-only (id, createdAt, updatedAt)</li>
            <li>The form validates input according to the schema rules</li>
          </ul>
        </div>
      </div>
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent className="w-screen min-w-screen max-w-screen">
          <DialogHeader className="">
            <DialogTitle className="">Dialog Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <DialogDemo />

      <div className="mt-8 mb-8">
        <h2 className="text-2xl font-bold mb-4">Example Editor Component</h2>
        <p className="mb-4 text-muted-foreground">
          This is a reusable editor component built using the DataEditorDialog with proper type safety:
        </p>
        
        <div className="flex gap-4 mb-4">
          {/* Edit mode example */}
          <ExampleEditor 
            edit={exampleData} 
          />
          
          {/* Create mode example */}
          <ExampleEditor 
          />
        </div>
        
        <div className="p-4 border rounded-lg bg-muted/30">
          <h3 className="font-semibold mb-2">Component Features</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Type-safe form handling using Effect-TS schemas</li>
            <li>Automatic form generation with proper validation</li>
            <li>Supports both create and edit modes with different fields</li>
            <li>Direct API integration with mutation hooks</li>
            <li>Responsive loading states during operations</li>
            <li>Proper type safety for all fields and configurations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
