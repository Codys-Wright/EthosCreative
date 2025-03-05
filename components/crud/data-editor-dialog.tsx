"use client";

import * as React from "react";
import { effectTsResolver } from "@hookform/resolvers/effect-ts";
import { useForm, useWatch } from "react-hook-form";
import { Schema } from "effect";
import type { FieldPath, Path, PathValue } from "react-hook-form";
import { GeneratedFieldType, FieldCustomization, FieldCustomizationRecord } from "./field-types";
import { format, isValid, parseISO } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TabbedSchemaForm } from "@/components/data-editing/tabbed-schema-form";
import { getSchemaFieldInfo as getSchemaInfo, isFieldRequired } from "@/components/data-editing/schema-utils";

// Define types for field generation and customization
// These have been moved to field-types.ts, so we'll remove the redundant definitions

// Field customization options is now imported from field-types.ts

// Tab definition for grouping fields - now generic over T
export type TabDefinition<T extends Record<string, any>> = {
  id: string;
  label: string;
  fields: Array<keyof T & string>; // Field keys must be keys from T and strings
  fieldCustomizations?: FieldCustomizationRecord<T>; // Tab-specific customizations are now type-safe
  description?: string; // Optional description for the tab
};

// Helper type to extract all field names from tabs
type ExtractTabFields<T extends Record<string, any>, Tabs extends TabDefinition<T>[]> = {
  [K in keyof Tabs]: Tabs[K] extends TabDefinition<T> ? Tabs[K]["fields"][number] : never
}[number];

// Define the props for the DataEditorDialog component
export type DataEditorDialogProps<T extends Record<string, any>> = {
  title: string;
  description?: string;
  data: T;
  onSave: (data: T) => void;
  keyInfo: {
    title: {
      field: keyof T & string;
      label: string;
    };
    subtitle?: {
      field: keyof T & string;
      label: string;
    };
    additionalFields?: {
      field: keyof T & string;
      label: string;
    }[];
  };
  schema: ReturnType<typeof Schema.make<T>>;
  tabs: TabDefinition<T>[]; // Now typesafe with generic T
  fieldCustomizations?: FieldCustomizationRecord<T>; // Global field customizations - type-safe to schema fields
  trigger?: React.ReactNode;
  // New props for external control
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  // New prop to indicate whether we're in create or edit mode
  mode?: 'create' | 'edit';
  // New prop to disable validation
  disableValidation?: boolean;
};

// Helper to extract schema info and infer field types
const getSchemaFieldInfo = <T extends Record<string, any>>(
  schema: ReturnType<typeof Schema.make<T>>,
  sampleData?: T,
  fieldCustomizations?: FieldCustomizationRecord<T>
): Record<string, { type: GeneratedFieldType; required: boolean }> => {
  const fields: Record<
    string,
    { type: GeneratedFieldType; required: boolean }
  > = {};

  try {
    // Use type assertions to access schema structure safely
    const schemaAny = schema as any;
    let schemaFields: Record<string, any> = {};
    
    // Try various paths to find schema field definitions
    if (schemaAny?.fields && typeof schemaAny.fields === 'object') {
      schemaFields = schemaAny.fields;
    } else if (schemaAny?.$schema?.fields && typeof schemaAny.$schema.fields === 'object') {
      schemaFields = schemaAny.$schema.fields;
    } else if (schemaAny?.ast) {
      // Try to extract from AST structure if available
      schemaFields = extractFieldsFromAst(schemaAny.ast);
    }

    // As a fallback, attempt to infer fields from the sampleData
    if (Object.keys(schemaFields).length === 0 && sampleData) {
      // This is just a simplistic fallback that assumes all fields are strings
      const fieldNames = Object.keys(sampleData);
      fieldNames.forEach(key => {
        // Try to infer type from the data value
        let fieldType: GeneratedFieldType = "text";
        const value = sampleData[key];
        if (typeof value === "number") fieldType = "number";
        else if (typeof value === "boolean") fieldType = "checkbox";
        else if (value instanceof Date) fieldType = "date";
        
        // Check if there's a customization that explicitly sets required
        const customization = fieldCustomizations?.[key as keyof T & string];
        // If required is explicitly set in customization, use that value, otherwise default to false
        const required = customization?.required !== undefined ? customization.required : false;
        
        fields[key] = { type: fieldType, required };
      });
      return fields;
    }

    Object.entries(schemaFields).forEach(([key, value]: [string, any]) => {
      // First check if there's a customization that explicitly sets required
      const customization = fieldCustomizations?.[key as keyof T & string];
      let required: boolean;
      
      // If required is explicitly set in customization, use that value
      if (customization?.required !== undefined) {
        required = customization.required;
      } else {
        // Otherwise determine if field is required (not nullable/optional) from schema
        const isNullable = value?.annotations?.nullable || value?.$schema?.annotations?.nullable || false;
        const isOptional = value?.annotations?.optional || value?.$schema?.annotations?.optional || false;
        required = !isNullable && !isOptional;
      }
      
      // Determine field type based on schema type information
      let fieldType: GeneratedFieldType = "text"; // Default

      const typeId = value?.ast?.type || value?.$schema?.ast?.type || "";
      if (typeof typeId === "string") {
        if (typeId.includes("number") || typeId.includes("Number"))
          fieldType = "number";
        else if (typeId.includes("boolean") || typeId.includes("Boolean"))
          fieldType = "checkbox";
        else if (typeId.includes("Date")) fieldType = "date";
        else if (typeId.includes("email") || typeId.includes("Email"))
          fieldType = "email";
        else fieldType = "text";
      }

      fields[key] = { type: fieldType, required };
    });
  } catch (e) {
    console.error("Error parsing schema:", e);
  }

  return fields;
};

// Helper function to extract fields from AST structure if available
const extractFieldsFromAst = (ast: any): Record<string, any> => {
  const fields: Record<string, any> = {};
  
  try {
    // This is a fallback approach - adjust based on actual schema structure
    if (ast && typeof ast === 'object' && !Array.isArray(ast)) {
      if ('propertySignatures' in ast) {
        const propertySignatures = ast.propertySignatures;
        if (Array.isArray(propertySignatures)) {
          for (const prop of propertySignatures) {
            if (prop && typeof prop === 'object' && 'name' in prop && typeof prop.name === 'string') {
              fields[prop.name] = prop;
            }
          }
        }
      }
    }
  } catch (e) {
    console.error("Error extracting fields from AST:", e);
  }
  
  return fields;
};

// Helper function to format a date for use in HTML date inputs
function formatDateForInput(value: any): string {
  if (!value) return '';
  
  try {
    // Handle both Date objects and string date values
    const date = value instanceof Date ? value : parseISO(String(value));
    
    // Check if date is valid before formatting
    if (!isValid(date)) return '';
    
    // Format date in yyyy-MM-dd format for HTML date inputs
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
}

// Helper function to handle tag inputs (convert between string and array)
function handleTagInput(value: any, mode: 'format' | 'parse'): string | string[] | null {
  if (mode === 'format') {
    // Format for display in input: array to comma-separated string
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return value || '';
  } else {
    // Parse for submission: comma-separated string to array or null
    if (typeof value === 'string') {
      if (!value.trim()) return null;
      // Split by comma, trim each entry, and filter out empty entries
      const tags = value.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      return tags.length > 0 ? tags : null;
    }
    return value === undefined ? null : value;
  }
}

export function DataEditorDialog<T extends Record<string, any>>({
  title,
  description,
  data,
  onSave,
  keyInfo,
  schema,
  tabs,
  fieldCustomizations = {},
  trigger,
  open = false,
  onOpenChange,
  mode = 'edit', // Default to edit mode
  disableValidation = false, // Default to validation enabled
}: DataEditorDialogProps<T>) {
  const [dialogOpen, setDialogOpen] = React.useState(open);
  const isCreationMode = mode === 'create';

  console.log("�� [DataEditorDialog] Mode:", {
    title,
    data: data ? Object.keys(data) : "No data",
    mode,
    isCreationMode,
    hasMainSchema: !!schema,
    dataFields: data ? Object.keys(data) : "No data"
  });

  // Get sample data fields from the provided schema
  const sampleDataFields = schema ? extractFieldsFromAst(schema.ast) : {};
  console.log('DataEditorDialog - Rendering with mode:', mode, 'schema:', schema ? 'present' : 'missing', 'sample fields:', Object.keys(sampleDataFields));

  // Determine which fields are auto-generated (e.g., id, timestamps)
  const autoGeneratedFields = Object.keys(sampleDataFields || {}).filter(
    (field) => ['id', 'createdAt', 'updatedAt', 'deletedAt'].includes(field)
  );
  
  // Get schema field information (type & required status)
  const schemaFields = React.useMemo(
    () => getSchemaFieldInfo(schema, data, fieldCustomizations),
    [schema, data, fieldCustomizations, isCreationMode]
  );
   
  // Log the detected required fields for debugging
  console.log('DataEditorDialog - Schema fields detected:', schemaFields);
  console.log('DataEditorDialog - Required fields:', Object.entries(schemaFields)
    .filter(([_, info]) => info.required)
    .map(([field]) => field));

  // Combined field customizations merging global and tab-specific ones
  const combinedFieldCustomizations = React.useMemo(() => {
    const combined = { ...fieldCustomizations };
    
    // Merge tab-specific customizations
    tabs.forEach(tab => {
      if (tab.fieldCustomizations) {
        Object.entries(tab.fieldCustomizations).forEach(([field, customization]) => {
          combined[field as keyof T & string] = {
            ...(combined[field as keyof T & string] || {}),
            ...customization,
          };
        });
      }
    });
    
    // Process fields for creation mode
    if (isCreationMode) {
      // Add the auto-generated fields logic here
      autoGeneratedFields.forEach(field => {
        combined[field as keyof T & string] = {
          ...(combined[field as keyof T & string] || {}),
          hidden: true,
        };
      });
      
      // Make updateOnly fields disabled and add a note about them being update-only
      Object.entries(combined).forEach(([field, customization]) => {
        if (customization?.updateOnly) {
          combined[field as keyof T & string] = {
            ...customization,
            readOnly: true,
            description: `${customization.description || ''} (Available after creation)`,
            placeholder: 'Available after creation',
            // Important: mark as NOT required in creation mode
            required: false,
          };
        }
      });
    }
    
    console.log('DataEditorDialog - Field customizations:', Object.keys(combined).length, 'fields customized');
    return combined;
  }, [fieldCustomizations, tabs, isCreationMode, autoGeneratedFields]);

  // When open state changes from outside
  React.useEffect(() => {
    setDialogOpen(open);
  }, [open]);

  // When internal open state changes, propagate up if handler provided
  const handleOpenChange = (newOpen: boolean) => {
    setDialogOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  // Handle form submission via TabbedSchemaForm
  const handleSave = (formData: T) => {
    onSave(formData);
    handleOpenChange(false);
  };

  // Extract title and subtitle values for the left panel
  const titleField = keyInfo.title.field;
  const titleValue = data?.[titleField] || "";

  const subtitleField = keyInfo.subtitle?.field;
  const subtitleValue = subtitleField ? data?.[subtitleField] || "" : "";

  console.log("🔧 [DataEditorDialog] Rendering form with:", {
    schemaProvided: schema ? "Schema provided" : "No schema",
    isCreationMode,
    combFieldCustomizationsCount: Object.keys(combinedFieldCustomizations).length,
    tabsCount: tabs.length,
    dataKeys: Object.keys(data || {})
  });

  // Dialog component with controlled open state
  return (
    <>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-[90vw] h-[90vh] flex flex-col overflow-hidden"
        style={{ maxHeight: "90vh", height: "90vh", width: "90vw" }}
      >
        <DialogHeader className="flex w-full mb-2">
          <DialogTitle className="text-xl">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="grid grid-cols-3 gap-6 h-full w-full overflow-hidden">
          {/* Left panel - Key information */}
          <div className="col-span-1 w-full bg-muted/30 rounded-lg p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-3">
              {keyInfo.title.label}
            </h3>
            <div className="text-xl font-bold mb-4 break-words">
              {titleValue || "Untitled"}
            </div>

            {keyInfo.subtitle && (
              <>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  {keyInfo.subtitle.label}
                </h4>
                <p className="text-base mb-5">
                  {subtitleValue || "No description"}
                </p>
              </>
            )}

              {keyInfo.additionalFields && (
                <div className="grid gap-4 mt-6">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Additional Information
                  </h4>
                  {keyInfo.additionalFields.map((field) => (
                    <div key={field.field as string} className="border-t pt-2">
                      <span className="text-xs text-muted-foreground block">
                  {field.label}
                      </span>
                      <p className="text-sm font-medium break-words">
                        {String(data?.[field.field] || "—")}
                </p>
              </div>
            ))}
                </div>
              )}

            <div className="mt-auto pt-4">
              <p className="text-xs text-muted-foreground">
                Use the tabs to edit different aspects of this data.
              </p>
            </div>
          </div>

            {/* Right panel - Tabs and form fields using TabbedSchemaForm */}
          <div className="col-span-2 w-full overflow-hidden px-2">
              <TabbedSchemaForm
                schema={schema}
                defaultValues={data}
                disableValidation={disableValidation}
                fieldCustomizations={combinedFieldCustomizations}
                tabs={tabs}
                onSubmit={handleSave}
                submitText={isCreationMode ? "Create" : "Save Changes"}
                showReset={true}
                tabbed={true}
              />
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
