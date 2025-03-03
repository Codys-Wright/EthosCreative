"use client";

import React from "react";
import { Path, useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GeneratedFieldType, FieldCustomizationRecord } from "@/components/crud/field-types";
import {
  getFieldType,
  getFieldLabel,
  getFieldDescription,
  getFieldPlaceholder,
  isFieldReadonly,
  isFieldRequired
} from "./schema-utils";
import { DateRenderer } from './field-renderers/date-renderer';
import { TagsRenderer } from "./field-renderers/tags-renderer";

export interface FieldRendererProps<T extends Record<string, any>> {
  name: keyof T & string;
  fieldCustomizations: FieldCustomizationRecord<T>;
  schemaFields: Record<string, { type: GeneratedFieldType; required: boolean }>;
}

/**
 * Renders a form field based on field type with appropriate controls and validation
 */
export function FormFieldRenderer<T extends Record<string, any>>({
  name,
  fieldCustomizations,
  schemaFields,
}: FieldRendererProps<T>) {
  const form = useFormContext();

  // First get the basic field type from schemas and customizations
  const baseFieldType = getFieldType(name, fieldCustomizations, schemaFields);
  
  // Then determine if we need to override based on field name patterns
  // We'll add this later when we fully integrate with the field-renderers module
  const fieldType = baseFieldType as GeneratedFieldType | "tags";
  
  const fieldLabel = getFieldLabel(name, fieldCustomizations);
  const description = getFieldDescription(name, fieldCustomizations);
  const placeholder = getFieldPlaceholder(name, fieldLabel, fieldCustomizations);
  const isReadonly = isFieldReadonly(name, fieldCustomizations);
  const isRequired = isFieldRequired(name, schemaFields);
  const options = fieldCustomizations[name]?.options || [];
  
  return (
    <FormField
      control={form.control}
      name={name as Path<any>}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel>
            {fieldLabel}
            {isRequired && <span className="text-destructive ml-1">*</span>}
          </FormLabel>
          <FormControl>
            {renderFieldByType(fieldType, field, placeholder, isReadonly, options)}
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * Renders the appropriate input control based on field type
 */
function renderFieldByType(
  fieldType: GeneratedFieldType | "tags",
  field: any,
  placeholder: string,
  isReadonly: boolean,
  options: { label: string; value: string }[] = []
) {
  switch (fieldType) {
    case "textarea":
      return (
        <Textarea
          {...field}
          value={field.value || ""}
          placeholder={placeholder}
          readOnly={isReadonly}
          className={`min-h-[80px] py-2 leading-relaxed ${isReadonly ? "bg-muted cursor-not-allowed opacity-70" : ""}`}
        />
      );
    case "checkbox":
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={`checkbox-${field.name}`}
            checked={!!field.value}
            onCheckedChange={field.onChange}
            disabled={isReadonly}
          />
          <label
            htmlFor={`checkbox-${field.name}`}
            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
              isReadonly ? "cursor-not-allowed opacity-70" : ""
            }`}
          >
            {placeholder}
          </label>
        </div>
      );
    case "select":
      return (
        <Select
          disabled={isReadonly}
          onValueChange={field.onChange}
          defaultValue={field.value}
          value={field.value}
        >
          <SelectTrigger className={`h-11 py-2 leading-relaxed ${isReadonly ? "bg-muted cursor-not-allowed opacity-70" : ""}`}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "number":
      return (
        <Input
          {...field}
          type="number"
          value={field.value || ""}
          placeholder={placeholder}
          readOnly={isReadonly}
          className={`h-11 py-2 leading-relaxed ${isReadonly ? "bg-muted cursor-not-allowed opacity-70" : ""}`}
          onChange={(e) => {
            const value = e.target.value === "" ? null : Number(e.target.value);
            field.onChange(value);
          }}
        />
      );
    case "date":
      return (
        <DateRenderer
          value={field.value}
          onChange={field.onChange}
          disabled={isReadonly}
          placeholder={placeholder}
        />
      );
    case "email":
      return (
        <Input
          {...field}
          type="email"
          value={field.value || ""}
          placeholder={placeholder}
          readOnly={isReadonly}
          className={`h-11 py-2 leading-relaxed ${isReadonly ? "bg-muted cursor-not-allowed opacity-70" : ""}`}
        />
      );
    // New specialized field types
    case "combobox":
      // TODO: Implement integration with TagsRenderer
      // For now, fallback to text input
      return (
        <div className="p-2 bg-muted/20 border border-dashed border-muted-foreground/40 rounded-md text-center text-sm text-muted-foreground">
          Tag Combobox (Coming Soon)
          <Input
            {...field}
            type="text"
            value={field.value || ""}
            placeholder={placeholder}
            readOnly={isReadonly}
            className={`h-11 py-2 leading-relaxed mt-2 ${isReadonly ? "bg-muted cursor-not-allowed opacity-70" : ""}`}
          />
        </div>
      );
    case "image":
      // TODO: Implement integration with ImageRenderer
      // For now, fallback to URL input
      return (
        <div className="p-2 bg-muted/20 border border-dashed border-muted-foreground/40 rounded-md text-center text-sm text-muted-foreground">
          Image Upload (Coming Soon)
          <Input
            {...field}
            type="text"
            value={field.value || ""}
            placeholder={placeholder || "Image URL"}
            readOnly={isReadonly}
            className={`h-11 py-2 leading-relaxed mt-2 ${isReadonly ? "bg-muted cursor-not-allowed opacity-70" : ""}`}
          />
        </div>
      );
    case "avatar":
      // TODO: Implement integration with AvatarRenderer
      // For now, fallback to URL input
      return (
        <div className="p-2 bg-muted/20 border border-dashed border-muted-foreground/40 rounded-md text-center text-sm text-muted-foreground">
          Avatar Upload (Coming Soon)
          <Input
            {...field}
            type="text"
            value={field.value || ""}
            placeholder={placeholder || "Avatar URL"}
            readOnly={isReadonly}
            className={`h-11 py-2 leading-relaxed mt-2 ${isReadonly ? "bg-muted cursor-not-allowed opacity-70" : ""}`}
          />
        </div>
      );
    case "richtext":
      // TODO: Implement rich text editor integration
      // For now, fallback to textarea
      return (
        <div className="p-2 bg-muted/20 border border-dashed border-muted-foreground/40 rounded-md text-center text-sm text-muted-foreground">
          Rich Text Editor (Coming Soon)
          <Textarea
            {...field}
            value={field.value || ""}
            placeholder={placeholder}
            readOnly={isReadonly}
            className={`min-h-[120px] py-2 leading-relaxed mt-2 ${isReadonly ? "bg-muted cursor-not-allowed opacity-70" : ""}`}
          />
        </div>
      );
    case "tags":
      // Convert options format if needed - support both {id, label} and {value, label} formats
      const tagOptions = options.length > 0 
        ? options.map(opt => 'value' in opt ? { id: opt.value, label: opt.label } : opt)
        : [
            { id: "important", label: "Important" },
            { id: "urgent", label: "Urgent" },
            { id: "feature", label: "Feature" },
            { id: "bug", label: "Bug" },
            { id: "documentation", label: "Documentation" },
            { id: "enhancement", label: "Enhancement" },
            { id: "question", label: "Question" },
            { id: "help", label: "Help Wanted" },
          ];
      
      return (
        <TagsRenderer
          value={field.value || []}
          onChange={field.onChange}
          disabled={isReadonly}
          placeholder={placeholder}
          suggestions={tagOptions}
        />
      );
    default:
      return (
        <Input
          {...field}
          type="text"
          value={field.value || ""}
          placeholder={placeholder}
          readOnly={isReadonly}
          className={`h-11 py-2 leading-relaxed ${isReadonly ? "bg-muted cursor-not-allowed opacity-70" : ""}`}
        />
      );
  }
} 