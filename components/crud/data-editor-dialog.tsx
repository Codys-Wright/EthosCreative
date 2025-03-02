"use client";

import * as React from "react";
import { effectTsResolver } from "@hookform/resolvers/effect-ts";
import { useForm } from "react-hook-form";
import { Schema } from "effect";
import type { FieldPath, Path, PathValue } from "react-hook-form";

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

// Define types for field generation and customization
export type GeneratedFieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "date"
  | "select"
  | "checkbox";

// Field customization options
export type FieldCustomization = {
  label?: string; // Custom label override
  description?: string; // Field description
  type?: GeneratedFieldType; // Override the auto-detected field type
  options?: { label: string; value: string }[]; // For select fields
  placeholder?: string; // Custom placeholder
  hidden?: boolean; // Whether to hide this field
  readonly?: boolean; // Whether the field is read-only (non-editable)
};

// Tab definition for grouping fields - now generic over T
export type TabDefinition<T extends Record<string, any>> = {
  id: string;
  label: string;
  fields: Array<keyof T & string>; // Field keys must be keys from T and strings
  fieldCustomizations?: Partial<Record<keyof T & string, FieldCustomization>>; // Tab-specific customizations are now type-safe
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
  fieldCustomizations?: Partial<Record<keyof T & string, FieldCustomization>>; // Global field customizations - type-safe to schema fields
  trigger?: React.ReactNode;
};

// Helper to extract schema info and infer field types
const getSchemaFieldInfo = <T extends Record<string, any>>(
  schema: ReturnType<typeof Schema.make<T>>,
  sampleData?: T
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
        
        fields[key] = { type: fieldType, required: false };
      });
      return fields;
    }

    Object.entries(schemaFields).forEach(([key, value]: [string, any]) => {
      // Determine if field is required (not nullable)
      const isNullable = value?.annotations?.nullable || value?.$schema?.annotations?.nullable || false;
      const isOptional = value?.annotations?.optional || value?.$schema?.annotations?.optional || false;
      const required = !isNullable && !isOptional;

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
}: DataEditorDialogProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(tabs[0]?.id || "");

  // Get the index of the current active tab
  const activeTabIndex = React.useMemo(
    () => tabs.findIndex((tab) => tab.id === activeTab),
    [tabs, activeTab]
  );

  // Function to move to the next tab
  const moveToNextTab = React.useCallback(() => {
    const nextTabIndex = (activeTabIndex + 1) % tabs.length;
    const nextTabId = tabs[nextTabIndex]?.id || "";
    setActiveTab(nextTabId);
    
    // Store the next tab ID to focus on its fields after tab switch
    return nextTabId;
  }, [activeTabIndex, tabs]);

  // Extract schema field information
  const schemaFields = React.useMemo(
    () => getSchemaFieldInfo<T>(schema, data),
    [schema, data],
  );

  // Create form with react-hook-form and effect-ts validation
  const form = useForm<T>({
    resolver: effectTsResolver(schema),
    defaultValues: data as any, // Cast to any to avoid type issues
  });

  // Watch the form values for the key info fields
  const titleValue = form.watch(
    keyInfo.title.field as Path<T>,
  ) as unknown as string;
  const subtitleValue = keyInfo.subtitle
    ? (form.watch(keyInfo.subtitle.field as Path<T>) as unknown as string)
    : undefined;

  function onSubmit(values: T) {
    onSave(values);
    setOpen(false);
  }

  // Helper to get field type (either from customization or schema)
  const getFieldType = (fieldName: keyof T & string): GeneratedFieldType => {
    // Check for field customization first (global, then tab-specific)
    const customType = fieldCustomizations[fieldName]?.type;
    if (customType) return customType;

    // Check for tab-specific customizations
    const currentTab = tabs.find(tab => tab.id === activeTab);
    if (currentTab?.fieldCustomizations?.[fieldName]?.type) {
      return currentTab.fieldCustomizations[fieldName]!.type!;
    }

    // Fall back to schema-inferred type
    return schemaFields[fieldName as string]?.type || "text";
  };

  // Helper to get field label (with smart defaults)
  const getFieldLabel = (fieldName: keyof T & string): string => {
    // Check for field customization first (global, then tab-specific)
    const customLabel = fieldCustomizations[fieldName]?.label;
    if (customLabel) return customLabel;

    // Check for tab-specific customizations
    const currentTab = tabs.find(tab => tab.id === activeTab);
    if (currentTab?.fieldCustomizations?.[fieldName]?.label) {
      return currentTab.fieldCustomizations[fieldName]!.label!;
    }

    // Generate label from field name (convert camelCase to Title Case)
    return (fieldName as string)
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  // Helper to get field description
  const getFieldDescription = (fieldName: keyof T & string): string | undefined => {
    // Check global customizations first
    if (fieldCustomizations[fieldName]?.description) {
      return fieldCustomizations[fieldName]?.description;
    }
    
    // Check tab-specific customizations
    const currentTab = tabs.find(tab => tab.id === activeTab);
    return currentTab?.fieldCustomizations?.[fieldName]?.description;
  };

  // Helper to check if field should be hidden
  const isFieldHidden = (fieldName: keyof T & string): boolean => {
    // Check global customizations first 
    if (fieldCustomizations[fieldName]?.hidden === true) {
      return true;
    }
    
    // Check tab-specific customizations
    const currentTab = tabs.find(tab => tab.id === activeTab);
    return currentTab?.fieldCustomizations?.[fieldName]?.hidden === true;
  };

  // Helper to check if field is readonly
  const isFieldReadonly = (fieldName: keyof T & string): boolean => {
    // Check global customizations first
    if (fieldCustomizations[fieldName]?.readonly === true) {
      return true;
    }
    
    // Check tab-specific customizations
    const currentTab = tabs.find(tab => tab.id === activeTab);
    return currentTab?.fieldCustomizations?.[fieldName]?.readonly === true;
  };

  // Helper to get field placeholder
  const getFieldPlaceholder = (fieldName: keyof T & string, defaultLabel: string): string => {
    // Check global customizations first
    if (fieldCustomizations[fieldName]?.placeholder) {
      return fieldCustomizations[fieldName]?.placeholder!;
    }
    
    // Check tab-specific customizations
    const currentTab = tabs.find(tab => tab.id === activeTab);
    if (currentTab?.fieldCustomizations?.[fieldName]?.placeholder) {
      return currentTab.fieldCustomizations[fieldName]!.placeholder!;
    }
    
    return defaultLabel;
  };

  // Helper function to check if a field is the last visible field in its tab
  const isLastFieldInTab = (tabId: string, fieldName: keyof T & string): boolean => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return false;

    // Get all visible fields in this tab
    const visibleFields = tab.fields.filter(field => !isFieldHidden(field));
    
    // Check if this field is the last visible field
    return visibleFields[visibleFields.length - 1] === fieldName;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Edit Data</Button>}
      </DialogTrigger>
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

            {keyInfo.additionalFields?.map((field) => (
              <div key={field.field} className="mb-4">
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  {field.label}
                </h4>
                <p className="text-base break-words">
                  {(() => {
                    const value = form.watch(field.field as Path<T>);
                    // Check if the value is a Date object and format it
                    if (value && typeof value === 'object' && 'toLocaleDateString' in value) {
                      try {
                        return value.toLocaleString();
                      } catch (e) {
                        return String(value);
                      }
                    }
                    // Otherwise display as before
                    return (value as unknown as string) || "Not specified";
                  })()}
                </p>
              </div>
            ))}

            <div className="mt-auto pt-4">
              <p className="text-xs text-muted-foreground">
                Use the tabs to edit different aspects of this data.
              </p>
            </div>
          </div>

          {/* Right panel - Tabs and form fields */}
          <div className="col-span-2 w-full overflow-hidden px-2">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col h-full w-full"
              >
                <Tabs
                  defaultValue={activeTab}
                  onValueChange={setActiveTab}
                  className="flex flex-col h-full w-full"
                >
                  <TabsList className="flex justify-start h-auto flex-wrap mb-5 flex-shrink-0 w-full">
                    {tabs.map((tab) => (
                      <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="flex-grow basis-0 min-w-[100px] py-2"
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {tabs.map((tab) => (
                    <TabsContent
                      key={tab.id}
                      value={tab.id}
                      className="flex-1 overflow-hidden w-full"
                    >
                      <ScrollArea className="h-[calc(100%-60px)] w-full pr-4">
                        <div className="flex flex-col gap-6 pb-6 w-full">
                          {tab.fields.map((fieldName) => {
                            if (isFieldHidden(fieldName)) return null;
                            const fieldType = getFieldType(fieldName);
                            const fieldLabel = getFieldLabel(fieldName);
                            const fieldDescription =
                              getFieldDescription(fieldName);
                            const placeholder =
                              getFieldPlaceholder(fieldName, fieldLabel);
                            const isReadonly = isFieldReadonly(fieldName);
                            const isLastField = isLastFieldInTab(tab.id, fieldName);

                            // Event handler for the Tab key on the last field
                            const handleKeyDown = (e: React.KeyboardEvent) => {
                              // If Tab is pressed without Shift on the last field, move to the next tab
                              if (e.key === 'Tab' && !e.shiftKey && isLastField) {
                                e.preventDefault();
                                const nextTabId = moveToNextTab();
                                
                                // Focus the first field in the next tab after it renders
                                setTimeout(() => {
                                  try {
                                    // Find the tab content that's currently active
                                    const nextTabContent = document.querySelector(`[role="tabpanel"][data-state="active"]`);
                                    if (nextTabContent) {
                                      // Find the first focusable element and focus it
                                      const firstInput = nextTabContent.querySelector('input, textarea, select, [role="checkbox"]');
                                      if (firstInput instanceof HTMLElement) {
                                        firstInput.focus();
                                      }
                                    }
                                  } catch (err) {
                                    console.error("Error focusing next tab field:", err);
                                  }
                                }, 100); // Increase timeout to ensure DOM updates
                              }
                            };

                            return (
                              <FormField
                                key={fieldName}
                                control={form.control}
                                name={fieldName as Path<T>}
                                render={({ field: formField }) => (
                                  <FormItem className="w-full space-y-2">
                                    <FormLabel className="text-sm font-medium">
                                      {fieldLabel}
                                    </FormLabel>
                                    <FormControl>
                                      {fieldType === "textarea" ? (
                                        <Textarea
                                          {...formField}
                                          placeholder={placeholder}
                                          value={formField.value || ""}
                                          readOnly={isReadonly}
                                          onKeyDown={isLastField ? handleKeyDown : undefined}
                                          className={
                                            isReadonly
                                              ? "bg-muted cursor-not-allowed opacity-70 w-full min-h-[100px]"
                                              : "w-full min-h-[100px]"
                                          }
                                        />
                                      ) : fieldType === "select" ? (
                                        <select
                                          {...formField}
                                          onKeyDown={isLastField ? handleKeyDown : undefined}
                                          className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${
                                            isReadonly
                                              ? "bg-muted cursor-not-allowed opacity-70"
                                              : ""
                                          }`}
                                          disabled={isReadonly}
                                        >
                                          {fieldCustomizations[
                                            fieldName
                                          ]?.options?.map((opt) => (
                                            <option
                                              key={opt.value}
                                              value={opt.value}
                                            >
                                              {opt.label}
                                            </option>
                                          ))}
                                        </select>
                                      ) : fieldType === "checkbox" ? (
                                        <div className="flex items-center space-x-2">
                                          <input
                                            type="checkbox"
                                            {...formField}
                                            checked={!!formField.value}
                                            onKeyDown={isLastField ? handleKeyDown : undefined}
                                            className={`h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary ${
                                              isReadonly
                                                ? "cursor-not-allowed opacity-70"
                                                : ""
                                            }`}
                                            disabled={isReadonly}
                                          />
                                          <span className="text-sm text-muted-foreground">
                                            {placeholder}
                                          </span>
                                        </div>
                                      ) : (
                                        <Input
                                          {...formField}
                                          type={fieldType}
                                          placeholder={placeholder}
                                          value={formField.value || ""}
                                          readOnly={isReadonly}
                                          onKeyDown={isLastField ? handleKeyDown : undefined}
                                          className={
                                            isReadonly
                                              ? "bg-muted cursor-not-allowed opacity-70 w-full"
                                              : "w-full"
                                          }
                                        />
                                      )}
                                    </FormControl>
                                    {fieldDescription && (
                                      <FormDescription className="text-xs">
                                        {fieldDescription}
                                      </FormDescription>
                                    )}
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  ))}
                </Tabs>

                <DialogFooter className="mt-4 pt-3 border-t flex-shrink-0 w-full">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
