"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { effectTsResolver } from "@hookform/resolvers/effect-ts";
import { 
  getFieldMetadata, 
  getTabGroups, 
  FieldType,
  TabGroupsConfig,
  FieldUIType,
  FieldTypeId,
  FieldUITypeId
} from "../schemas";
import { FormFieldRenderer, FormFieldType } from "./FormFieldRenderer";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { SchemaAST } from "effect";
import { Option } from "effect";

// Props for the SchemaFormRenderer component
interface SchemaFormRendererProps {
  schema: any;
  schemaName: string;
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  mode?: 'create' | 'edit';
  title?: string;
  description?: string;
}

// Map schema field types to form field types with UI type override
const mapFieldType = (metadata: { type: FieldType; uiType?: FieldUIType }): FormFieldType => {
  // First check if a UI type has been explicitly specified
  if (metadata.uiType) {
    // The UI type directly maps to the form field type
    return metadata.uiType as FormFieldType;
  }
  
  // Fall back to inferring from the field type if no UI type is specified
  switch (metadata.type) {
    case 'string': return 'text';
    case 'number': return 'number';
    case 'boolean': return 'checkbox';
    case 'date': return 'calendar'; // Default to calendar for date types
    case 'email': return 'email';
    case 'void': return 'text'; // Fallback
    default: return 'text'; // Default to text input
  }
};

export function SchemaFormRenderer({
  schema,
  schemaName,
  initialData = {},
  onSubmit,
  mode = 'create',
  title,
  description
}: SchemaFormRendererProps) {
  // Get tab groups from the schema
  const tabGroups = getTabGroups(schema);
  
  // Set the first tab group as active by default
  const firstTabGroup = Object.keys(tabGroups)[0] || 'main';
  const [activeTab, setActiveTab] = useState<string>(firstTabGroup);
  
  // Sort tab groups by order property or alphabetically
  const sortedTabGroups = Object.entries(tabGroups)
    .sort(([groupA, configA], [groupB, configB]) => {
      const orderA = configA.order ?? 999;
      const orderB = configB.order ?? 999;
      return orderA !== orderB ? orderA - orderB : groupA.localeCompare(groupB);
    });
    
  // Set up form with schema validation
  const form = useForm({
    resolver: effectTsResolver(schema),
    defaultValues: initialData,
    mode: "onBlur"
  });
  
  // Handler for form submission
  const handleSubmit = (data: Record<string, any>) => {
    console.log(`Submitting ${schemaName} form data:`, data);
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <Card className="w-full">
          {(title || description) && (
            <CardHeader>
              {title && <CardTitle>{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <CardContent>
              <TabsList className="mb-6">
                {sortedTabGroups.map(([groupName, config]) => (
                  <TabsTrigger
                    key={groupName}
                    value={groupName}
                    className="flex items-center gap-2"
                  >
                    {config.label || groupName}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {sortedTabGroups.map(([groupName, config]) => (
                <TabsContent key={groupName} value={groupName} className="space-y-4">
                  {config.fields.map(fieldName => {
                    const metadata = getFieldMetadata(schema, fieldName);
                    if (!metadata) return null;
                    
                    // Debug: log field metadata and type mapping
                    console.log(`Field: ${fieldName}, Type: ${metadata.type}, UI Type: ${metadata.uiType || 'none'}`);
                    
                    // Skip render for fields that shouldn't be visible based on mode
                    if (mode === 'create' && metadata.isUpdateOnly) return null;
                    
                    // Determine field type based on field name
                    let formFieldType: FormFieldType = 'text'; // Default to text
                    
                    // Map specific fields to their form controls based on field name
                    switch (fieldName.toLowerCase()) {
                      case 'description':
                        formFieldType = 'textarea';
                        break;
                      case 'tags':
                        formFieldType = 'tags';
                        break;
                      case 'numbervalue':
                        formFieldType = 'number';
                        break;
                      case 'booleanvalue':
                        formFieldType = 'checkbox';
                        break;
                      case 'datestring':
                        formFieldType = 'date';
                        break;
                      case 'datevalue':
                        formFieldType = 'calendar';
                        break;
                      case 'email':
                        formFieldType = 'email';
                        break;
                      default:
                        // Use text input as default
                        formFieldType = 'text';
                        break;
                    }
                    
                    console.log(`Using field type ${formFieldType} for ${fieldName}`);
                    
                    return (
                      <FormFieldRenderer
                        key={fieldName}
                        name={fieldName}
                        control={form.control}
                        fieldType={formFieldType}
                        label={metadata.label}
                        description={metadata.description}
                        placeholder={metadata.placeholder}
                        isRequired={metadata.isRequired}
                        isReadOnly={metadata.isUpdateOnly}
                        className="mb-4"
                      />
                    );
                  })}
                </TabsContent>
              ))}
            </CardContent>
            
            <CardFooter className="flex justify-end gap-2 pt-4">
              <Button variant="outline" type="button" onClick={() => form.reset()}>
                Reset
              </Button>
              <Button type="submit">
                {mode === 'create' ? 'Create' : 'Update'}
              </Button>
            </CardFooter>
          </Tabs>
        </Card>
      </form>
    </Form>
  );
} 