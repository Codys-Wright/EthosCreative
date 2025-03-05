"use client";

import React from "react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { TagsInput } from "./TagsInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ImageUploader } from "@/components/uploads/ImageUploader";
import { ArtistTypeContentSelector } from "@/components/forms/ArtistTypeContentSelector";

// Define custom field types beyond the basic HTML input types
export type FormFieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "password"
  | "date"
  | "calendar" // Date picker with calendar UI
  | "select"
  | "checkbox"
  | "radio"
  | "image-url" // For image uploader
  | "blog-selector" // For blog content selector
  | "tags"; // For tag input

export interface FormFieldRendererProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  fieldType: FormFieldType;
  label?: string;
  description?: string;
  placeholder?: string;
  options?: { label: string; value: string }[]; // For select/radio/tags fields
  isRequired?: boolean;
  isReadOnly?: boolean;
  isDisabled?: boolean;
  className?: string;
}

export function FormFieldRenderer<TFieldValues extends FieldValues>({
  name,
  control,
  fieldType,
  label,
  description,
  placeholder,
  options = [],
  isRequired = false,
  isReadOnly = false,
  isDisabled = false,
  className,
}: FormFieldRendererProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
              {isReadOnly && (
                <span className="text-gray-500 text-xs ml-2">(Read-only)</span>
              )}
            </FormLabel>
          )}

          <FormControl>
            <div>
              {renderFieldByType(
                fieldType,
                field,
                placeholder || "",
                isReadOnly || isDisabled,
                options,
                isRequired,
              )}
            </div>
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
  fieldType: FormFieldType,
  field: any,
  placeholder: string,
  isReadonly: boolean,
  options: { label: string; value: string }[] = [],
  isRequired: boolean = false,
) {
  switch (fieldType) {
    case "textarea":
      return (
        <Textarea
          {...field}
          placeholder={placeholder}
          readOnly={isReadonly}
          disabled={isReadonly}
          value={
            field.value === null || field.value === undefined ? "" : field.value
          }
          className={`min-h-[80px] ${isReadonly ? "bg-muted cursor-not-allowed opacity-70" : ""}`}
        />
      );

    case "number":
      return (
        <Input
          {...field}
          type="number"
          value={
            field.value === null || field.value === undefined ? "" : field.value
          }
          placeholder={placeholder}
          readOnly={isReadonly}
          disabled={isReadonly}
          className={isReadonly ? "bg-muted cursor-not-allowed opacity-70" : ""}
          onChange={(e) => {
            // Ensure we convert empty strings to undefined and other values to numbers
            const rawValue = e.target.value;
            let value: number | undefined = undefined;

            // Only parse if there's a value to parse
            if (rawValue !== "") {
              // Convert to number and validate - use parseFloat for decimals
              value = Number(rawValue);

              // Fallback to undefined if not a valid number
              if (isNaN(value)) {
                value = undefined;
              }
            }

            console.log(
              `Number field changed: from=${rawValue}, to=${value}, type=${typeof value}`,
            );
            field.onChange(value);
          }}
        />
      );

    case "checkbox":
      return (
        <div className="flex items-center space-x-2">
          <Checkbox
            id={field.name}
            checked={!!field.value}
            onCheckedChange={field.onChange}
            disabled={isReadonly}
          />
          {placeholder && (
            <label
              htmlFor={field.name}
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {placeholder}
            </label>
          )}
        </div>
      );

    case "select":
      return (
        <Select
          value={field.value?.toString() || ""}
          onValueChange={field.onChange}
          disabled={isReadonly}
        >
          <SelectTrigger
            className={
              isReadonly ? "bg-muted cursor-not-allowed opacity-70" : ""
            }
          >
            <SelectValue placeholder={placeholder || "Select an option"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">-- Select --</SelectItem>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "radio":
      return (
        <RadioGroup
          value={field.value?.toString() || ""}
          onValueChange={field.onChange}
          disabled={isReadonly}
          className="flex flex-col space-y-1"
        >
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem
                value={option.value}
                id={`${field.name}-${option.value}`}
              />
              <label htmlFor={`${field.name}-${option.value}`}>
                {option.label}
              </label>
            </div>
          ))}
        </RadioGroup>
      );

    case "date":
      return (
        <Input
          {...field}
          type="date"
          placeholder={placeholder}
          readOnly={isReadonly}
          disabled={isReadonly}
          className={isReadonly ? "bg-muted cursor-not-allowed opacity-70" : ""}
          value={
            (field.value as any) instanceof Date
              ? (field.value as Date).toISOString().split("T")[0]
              : field.value || ""
          }
        />
      );

    case "calendar":
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !field.value && "text-muted-foreground",
                isReadonly && "bg-muted cursor-not-allowed opacity-70",
              )}
              disabled={isReadonly}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {field.value
                ? (field.value as any) instanceof Date
                  ? format(field.value as Date, "PPP")
                  : typeof field.value === "string" &&
                      !isNaN(new Date(field.value).getTime())
                    ? format(new Date(field.value), "PPP")
                    : placeholder || "Pick a date"
                : placeholder || "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={
                (field.value as any) instanceof Date
                  ? (field.value as Date)
                  : typeof field.value === "string" &&
                      !isNaN(new Date(field.value).getTime())
                    ? new Date(field.value)
                    : undefined
              }
              onSelect={(date: Date | undefined) => field.onChange(date)}
              disabled={isReadonly}
              initialFocus
            />
            {field.value && (
              <div className="p-3 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => field.onChange(null)}
                  className="w-full"
                >
                  Clear
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      );

    case "tags":
      return (
        <TagsInput
          value={field.value || []}
          onChange={field.onChange}
          placeholder={placeholder}
          disabled={isReadonly}
          readOnly={isReadonly}
          className={isReadonly ? "bg-muted cursor-not-allowed opacity-70" : ""}
        />
      );

    case "email":
      return (
        <Input
          {...field}
          type="email"
          value={
            field.value === null || field.value === undefined ? "" : field.value
          }
          placeholder={placeholder}
          readOnly={isReadonly}
          disabled={isReadonly}
          className={isReadonly ? "bg-muted cursor-not-allowed opacity-70" : ""}
        />
      );

    case "password":
      return (
        <Input
          {...field}
          type="password"
          value={
            field.value === null || field.value === undefined ? "" : field.value
          }
          placeholder={placeholder}
          readOnly={isReadonly}
          disabled={isReadonly}
          className={isReadonly ? "bg-muted cursor-not-allowed opacity-70" : ""}
        />
      );

    case "image-url":
      return (
        <ImageUploader
          value={field.value}
          onChange={field.onChange}
          className={isReadonly ? "pointer-events-none opacity-70" : ""}
        />
      );

    case "blog-selector":
      return (
        <ArtistTypeContentSelector
          value={field.value}
          onChange={field.onChange}
        />
      );

    // Default to text input
    default:
      return (
        <Input
          {...field}
          type="text"
          value={
            field.value === null || field.value === undefined ? "" : field.value
          }
          placeholder={placeholder}
          readOnly={isReadonly}
          disabled={isReadonly}
          className={isReadonly ? "bg-muted cursor-not-allowed opacity-70" : ""}
        />
      );
  }
}
