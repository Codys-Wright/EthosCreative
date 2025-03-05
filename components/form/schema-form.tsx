"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { effectTsResolver } from "@hookform/resolvers/effect-ts";
import { Schema } from "effect";
import type { Path } from "react-hook-form";

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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GeneratedFieldType, FieldCustomizationRecord } from "@/components/crud/field-types";

/**
 * Helper function to extract field information from a schema
 */
function getSchemaFieldInfo<T extends Record<string, any>>(
  schema: ReturnType<typeof Schema.make<T>>,
  sampleData?: Partial<T>,
  fieldCustomizations?: FieldCustomizationRecord<T>
): Record<string, { type: GeneratedFieldType; required: boolean }> {
  const fields: Record<string, { type: GeneratedFieldType; required: boolean }> = {};

  try {
    // First try to determine fields from the schema object
    // This is a simplified approach as Effect.Schema can have complex structures
    // We'll just check for properties and try to infer types
    if (schema && typeof schema === 'object') {
      // Try to extract field information from various locations in the schema object
      // This is a best-effort approach that may need adjustments based on your actual schema structure
      const schemaFields = Object.keys(sampleData || {});
      
      for (const key of schemaFields) {
        // Use field customization if available
        const customization = fieldCustomizations?.[key as keyof T & string];
        let required = customization?.required ?? false;
        
        // Determine field type based on sample data or customization
        let fieldType: GeneratedFieldType = customization?.type || "text";
        
        if (!customization?.type && sampleData && key in sampleData) {
          const value = sampleData[key];
          if (typeof value === "number") fieldType = "number";
          else if (typeof value === "boolean") fieldType = "checkbox";
          else if (Object.prototype.toString.call(value) === "[object Date]") fieldType = "date";
          else if (typeof value === "string" && value.includes("@")) fieldType = "email";
        }
        
        fields[key] = { type: fieldType, required };
      }
    }

    // If we couldn't determine fields from schema, use sample data
    if (Object.keys(fields).length === 0 && sampleData) {
      const fieldNames = Object.keys(sampleData);
      fieldNames.forEach(key => {
        // Try to infer type from the data value
        let fieldType: GeneratedFieldType = "text";
        const value = sampleData[key];
        
        if (typeof value === "number") fieldType = "number";
        else if (typeof value === "boolean") fieldType = "checkbox";
        else if (Object.prototype.toString.call(value) === "[object Date]") fieldType = "date";
        else if (typeof value === "string" && value.includes("@")) fieldType = "email";
        
        // Check if there's a customization that explicitly sets required
        const customization = fieldCustomizations?.[key as keyof T & string];
        // If required is explicitly set in customization, use that value, otherwise default to false
        const required = customization?.required ?? false;
        
        fields[key] = { type: fieldType, required };
      });
    }
  } catch (e) {
    console.error("Error parsing schema:", e);
  }

  return fields;
}

/**
 * Props for the SchemaForm component
 */
export type SchemaFormProps<T extends Record<string, any>> = {
  /** The schema to validate against */
  schema: ReturnType<typeof Schema.make<T>>;
  /** Initial values for the form */
  defaultValues?: Partial<T>;
  /** Whether to disable schema validation */
  disableValidation?: boolean;
  /** Field customizations to control the appearance and behavior of fields */
  fieldCustomizations?: FieldCustomizationRecord<T>;
  /** Function called when the form is submitted with valid data */
  onSubmit: (data: T) => void;
  /** Optional title for the form */
  title?: string;
  /** Optional description for the form */
  description?: string;
  /** Button text for the submit button (defaults to "Submit") */
  submitText?: string;
  /** Whether to show a reset button */
  showReset?: boolean;
  /** The fields to render (default: all fields derived from schema) */
  fields?: Array<keyof T & string>;
};

/**
 * A form component that renders fields based on an Effect schema
 */
export function SchemaForm<T extends Record<string, any>>({
  schema,
  defaultValues = {} as Partial<T>,
  disableValidation = false,
  fieldCustomizations = {},
  onSubmit,
  title,
  description,
  submitText = "Submit",
  showReset = false,
  fields,
}: SchemaFormProps<T>) {
  // Create form with react-hook-form and effect-ts validation
  const form = useForm<T>({
    resolver: disableValidation ? undefined : effectTsResolver(schema),
    defaultValues: defaultValues as any,
  });

  // Extract schema field information
  const schemaFields = React.useMemo(
    () => getSchemaFieldInfo<T>(schema, defaultValues, fieldCustomizations),
    [schema, defaultValues, fieldCustomizations],
  );

  // If fields are not provided, use all fields from the schema
  const fieldsToRender = fields || Object.keys(schemaFields) as Array<keyof T & string>;

  // Helper to get field type (either from customization or schema)
  const getFieldType = (fieldName: keyof T & string): GeneratedFieldType => {
    // Check for field customization first
    const customType = fieldCustomizations[fieldName]?.type;
    if (customType) return customType;

    // Fall back to schema-inferred type
    return schemaFields[fieldName as string]?.type || "text";
  };

  // Helper to get field label (with smart defaults)
  const getFieldLabel = (fieldName: keyof T & string): string => {
    // Check for field customization first
    const customLabel = fieldCustomizations[fieldName]?.label;
    if (customLabel) return customLabel;

    // Generate label from field name (convert camelCase to Title Case)
    return (fieldName as string)
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  // Helper to get field description
  const getFieldDescription = (fieldName: keyof T & string): string | undefined => {
    return fieldCustomizations[fieldName]?.description;
  };

  // Helper to get field placeholder
  const getFieldPlaceholder = (fieldName: keyof T & string, defaultLabel: string): string => {
    if (fieldCustomizations[fieldName]?.placeholder) {
      return fieldCustomizations[fieldName]?.placeholder!;
    }
    return defaultLabel;
  };

  // Helper to check if field is readonly
  const isFieldReadonly = (fieldName: keyof T & string): boolean => {
    return fieldCustomizations[fieldName]?.readOnly === true;
  };

  // Handle form submission
  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  // Handle form reset
  const handleReset = () => {
    form.reset(defaultValues as any);
  };

  return (
    <div className="w-full">
      {title && <h2 className="text-2xl font-bold mb-2">{title}</h2>}
      {description && <p className="text-muted-foreground mb-6">{description}</p>}

      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {fieldsToRender.map((fieldName) => {
            const fieldType = getFieldType(fieldName);
            const fieldLabel = getFieldLabel(fieldName);
            const description = getFieldDescription(fieldName);
            const placeholder = getFieldPlaceholder(fieldName, fieldLabel);
            const isReadonly = isFieldReadonly(fieldName);

            return (
              <FormField
                key={fieldName as string}
                control={form.control}
                name={fieldName as Path<T>}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{fieldLabel}</FormLabel>
                    <FormControl>
                      {fieldType === "textarea" ? (
                        <Textarea
                          {...field}
                          value={field.value || ""}
                          placeholder={placeholder}
                          readOnly={isReadonly}
                          className={isReadonly ? "bg-muted cursor-not-allowed opacity-70" : ""}
                        />
                      ) : fieldType === "checkbox" ? (
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`checkbox-${fieldName}`}
                            checked={!!field.value}
                            onCheckedChange={field.onChange}
                            disabled={isReadonly}
                          />
                          <label
                            htmlFor={`checkbox-${fieldName}`}
                            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                              isReadonly ? "cursor-not-allowed opacity-70" : ""
                            }`}
                          >
                            {placeholder}
                          </label>
                        </div>
                      ) : (
                        <Input
                          {...field}
                          type={fieldType === "number" ? "number" : fieldType === "date" ? "date" : "text"}
                          value={field.value || ""}
                          placeholder={placeholder}
                          readOnly={isReadonly}
                          className={isReadonly ? "bg-muted cursor-not-allowed opacity-70" : ""}
                        />
                      )}
                    </FormControl>
                    {description && <FormDescription>{description}</FormDescription>}
                    <FormMessage />
                  </FormItem>
                )}
              />
            );
          })}

          <div className="flex justify-end gap-2 pt-4">
            {showReset && (
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset
              </Button>
            )}
            <Button type="submit">{submitText}</Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 