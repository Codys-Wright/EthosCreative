"use client";

import * as React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { effectTsResolver } from "@hookform/resolvers/effect-ts";
import { Schema } from "effect";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FieldCustomizationRecord } from "@/components/crud/field-types";
import { getSchemaFieldInfo, TabDefinition, isFieldRequired } from "./schema-utils";
import { FormFieldRenderer } from "./field-renderers";

/**
 * Props for the TabbedSchemaForm component
 */
export type TabbedSchemaFormProps<T extends Record<string, any>> = {
  /** The schema to validate against */
  schema: ReturnType<typeof Schema.make<T>>;
  /** Initial values for the form */
  defaultValues?: Partial<T>;
  /** Whether to disable schema validation */
  disableValidation?: boolean;
  /** Field customizations to control the appearance and behavior of fields */
  fieldCustomizations?: FieldCustomizationRecord<T>;
  /** Tab definitions for organizing fields */
  tabs: TabDefinition<T>[];
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
};

/**
 * A form component that renders fields based on an Effect schema and organizes them into tabs
 */
export function TabbedSchemaForm<T extends Record<string, any>>({
  schema,
  defaultValues = {} as Partial<T>,
  disableValidation = false,
  fieldCustomizations = {},
  tabs,
  onSubmit,
  title,
  description,
  submitText = "Submit",
  showReset = false,
}: TabbedSchemaFormProps<T>) {
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

  // State for active tab
  const [activeTab, setActiveTab] = React.useState(tabs[0]?.id || "");

  // Handle form submission
  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  // Handle form reset
  const handleReset = () => {
    form.reset(defaultValues as any);
  };

  // Function to count required fields in a tab
  const countRequiredFields = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (!tab) return 0;
    
    return tab.fields.filter(field => isFieldRequired(field, schemaFields)).length;
  };

  return (
    <div className="w-full">
      {title && <h2 className="text-2xl font-bold mb-2">{title}</h2>}
      {description && <p className="text-muted-foreground mb-6">{description}</p>}

      <FormProvider {...form}>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-8">
                {tabs.map((tab) => {
                  const requiredCount = countRequiredFields(tab.id);
                  return (
                    <TabsTrigger key={tab.id} value={tab.id} className="relative">
                      {tab.label}
                      {requiredCount > 0 && (
                        <Badge 
                          variant="outline" 
                          className="ml-2 bg-destructive/10 text-destructive border-destructive/20 text-xs"
                        >
                          {requiredCount}
                        </Badge>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              {tabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="space-y-6">
                  {tab.description && (
                    <p className="text-muted-foreground mb-4">{tab.description}</p>
                  )}
                  {tab.fields.map((fieldName) => (
                    <FormFieldRenderer
                      key={fieldName as string}
                      name={fieldName}
                      fieldCustomizations={fieldCustomizations}
                      schemaFields={schemaFields}
                    />
                  ))}
                </TabsContent>
              ))}
            </Tabs>

            <div className="flex justify-end gap-2 pt-6 border-t mt-8">
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