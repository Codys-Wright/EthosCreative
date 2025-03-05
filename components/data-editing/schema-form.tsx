"use client";

import * as React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { effectTsResolver } from "@hookform/resolvers/effect-ts";
import { Schema } from "effect";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FieldCustomizationRecord } from "@/components/crud/field-types";
import { getSchemaFieldInfo } from "./schema-utils";
import { FormFieldRenderer } from "./field-renderers";

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

  // Handle form submission
  const handleSubmit = form.handleSubmit((data) => {
    // Process numeric fields - convert any string numbers to actual numbers
    const processedData = Object.entries(data).reduce<Record<string, any>>((acc, [key, value]) => {
      // If the field is a number type but the value is a string, convert it
      if (
        schemaFields[key as keyof typeof schemaFields]?.type === 'number' && 
        typeof value === 'string' && 
        value !== ''
      ) {
        acc[key] = Number(value);
      } else {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>) as T;
    
    onSubmit(processedData);
  });

  // Handle form reset
  const handleReset = () => {
    form.reset(defaultValues as any);
  };

  return (
    <div className="w-full">
      {title && <h2 className="text-2xl font-bold mb-2">{title}</h2>}
      {description && <p className="text-muted-foreground mb-6">{description}</p>}

      <FormProvider {...form}>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {fieldsToRender.map((fieldName) => (
              <FormFieldRenderer
                key={fieldName as string}
                name={fieldName}
                fieldCustomizations={fieldCustomizations}
                schemaFields={schemaFields}
              />
            ))}

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
      </FormProvider>
    </div>
  );
} 