"use client";

import { useState } from "react";
import { Schema as S } from "effect";
import { toast } from "sonner";
import { TabbedSchemaForm } from "@/components/data-editing";
import { FieldCustomizationRecord } from "@/components/crud/field-types";
import { TabDefinition } from "@/components/data-editing";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

// Define a comprehensive schema with all field types
const AllFieldsSchema = S.Struct({
  // Text Fields
  title: S.String.pipe(S.minLength(3), S.maxLength(100)),
  description: S.String.pipe(S.minLength(10), S.maxLength(500)),
  email: S.String.pipe(S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  url: S.String.pipe(S.pattern(/^https?:\/\/.+\..+/)),
  
  // Number Fields
  age: S.Number.pipe(S.between(18, 120)),
  price: S.Number.pipe(S.between(0, 1000000)),
  rating: S.Number.pipe(S.between(0, 5)),
  
  // Boolean Fields
  active: S.Boolean,
  featured: S.Boolean,
  notifications: S.Boolean,
  
  // Date Fields
  birthDate: S.instanceOf(Date),
  createdAt: S.instanceOf(Date),
  scheduledDate: S.instanceOf(Date),
  expiryDate: S.instanceOf(Date),
  
  // Array Fields
  tags: S.Array(S.String).pipe(S.minItems(1)),
  categories: S.Array(S.String),
  skills: S.Array(S.String),
  
  // Selection Fields
  status: S.String,
  role: S.String,
  priority: S.String,
  
  // Optional Fields
  bio: S.NullOr(S.String),
  avatar: S.NullOr(S.String),
  coverImage: S.NullOr(S.String),
});

// Define a type from the schema
type AllFieldsType = typeof AllFieldsSchema.Type;

// Define field customizations for all fields
const AllFieldsCustomizations: FieldCustomizationRecord<AllFieldsType> = {
  // Text Fields
  title: {
    label: "Title",
    placeholder: "Enter a title",
    description: "The main title or name",
    required: true,
  },
  description: {
    type: "textarea",
    label: "Description",
    placeholder: "Enter a detailed description",
    description: "A longer text description",
    required: true,
  },
  email: {
    type: "email",
    label: "Email Address",
    placeholder: "your.email@example.com",
    description: "A valid email address",
    required: true,
  },
  url: {
    label: "Website URL",
    placeholder: "https://example.com",
    description: "Your website address",
    required: false,
  },
  
  // Number Fields
  age: {
    type: "number",
    label: "Age",
    placeholder: "Enter your age",
    description: "Your age in years (0-120)",
    required: true,
  },
  price: {
    type: "number",
    label: "Price",
    placeholder: "Enter a price",
    description: "The price in dollars",
    required: false,
  },
  rating: {
    type: "number",
    label: "Rating",
    placeholder: "Rate from 0-5",
    description: "A rating from 0 to 5 stars",
    required: false,
  },
  
  // Boolean Fields
  active: {
    type: "checkbox",
    label: "Active Status",
    description: "Whether this item is active",
    required: true,
  },
  featured: {
    type: "checkbox",
    label: "Featured Item",
    description: "Show this item in featured lists",
    required: false,
  },
  notifications: {
    type: "checkbox",
    label: "Enable Notifications",
    description: "Receive notifications for updates",
    required: false,
  },
  
  // Date Fields
  birthDate: {
    type: "date",
    label: "Birth Date",
    description: "Your date of birth",
    required: true,
  },
  createdAt: {
    type: "date",
    label: "Created Date",
    description: "When this item was created",
    required: false,
  },
  scheduledDate: {
    type: "date",
    label: "Scheduled Date",
    description: "When this item is scheduled for",
    required: false,
  },
  expiryDate: {
    type: "date",
    label: "Expiry Date",
    description: "When this item expires",
    required: false,
  },
  
  // Array/Tags Fields
  tags: {
    type: "tags" as any,
    label: "Tags",
    placeholder: "Add tags...",
    description: "Keywords or tags for this item",
    required: true,
    options: [
      { id: "important", label: "Important" },
      { id: "urgent", label: "Urgent" },
      { id: "completed", label: "Completed" },
      { id: "pending", label: "Pending" },
      { id: "review", label: "Review" },
    ] as any,
  },
  categories: {
    type: "tags" as any,
    label: "Categories",
    placeholder: "Add categories...",
    description: "Categories this item belongs to",
    required: false,
    options: [
      { id: "technology", label: "Technology" },
      { id: "business", label: "Business" },
      { id: "health", label: "Health" },
      { id: "education", label: "Education" },
      { id: "entertainment", label: "Entertainment" },
    ] as any,
  },
  skills: {
    type: "tags" as any,
    label: "Skills",
    placeholder: "Add skills...",
    description: "Skills or abilities",
    required: false,
    options: [
      { id: "javascript", label: "JavaScript" },
      { id: "python", label: "Python" },
      { id: "design", label: "Design" },
      { id: "writing", label: "Writing" },
      { id: "marketing", label: "Marketing" },
    ] as any,
  },
  
  // Selection Fields
  status: {
    type: "select",
    label: "Status",
    description: "Current status of this item",
    required: true,
    options: [
      { label: "Draft", value: "draft" },
      { label: "Published", value: "published" },
      { label: "Archived", value: "archived" },
      { label: "Deleted", value: "deleted" },
    ],
  },
  role: {
    type: "select",
    label: "Role",
    description: "User role or permission level",
    required: true,
    options: [
      { label: "Admin", value: "admin" },
      { label: "Editor", value: "editor" },
      { label: "Author", value: "author" },
      { label: "Viewer", value: "viewer" },
    ],
  },
  priority: {
    type: "select",
    label: "Priority",
    description: "Priority level",
    required: false,
    options: [
      { label: "Low", value: "low" },
      { label: "Medium", value: "medium" },
      { label: "High", value: "high" },
      { label: "Critical", value: "critical" },
    ],
  },
  
  // Optional Fields
  bio: {
    type: "textarea",
    label: "Biography",
    placeholder: "Tell us about yourself",
    description: "A short biography (optional)",
    required: false,
  },
  avatar: {
    type: "image",
    label: "Avatar",
    description: "Your profile picture",
    required: false,
  },
  coverImage: {
    type: "image",
    label: "Cover Image",
    description: "A banner or cover image",
    required: false,
  },
};

// Define tab structure for organizing fields
const AllFieldsTabs: TabDefinition<AllFieldsType>[] = [
  {
    id: "text-fields",
    label: "Text Fields",
    description: "Basic text input fields",
    fields: ["title", "description", "email", "url"],
  },
  {
    id: "number-fields",
    label: "Number Fields",
    description: "Numeric input fields",
    fields: ["age", "price", "rating"],
  },
  {
    id: "boolean-fields",
    label: "Toggle Fields",
    description: "On/off checkbox fields",
    fields: ["active", "featured", "notifications"],
  },
  {
    id: "date-fields",
    label: "Date Fields",
    description: "Date selection fields",
    fields: ["birthDate", "createdAt", "scheduledDate", "expiryDate"],
  },
  {
    id: "array-fields",
    label: "Tag Fields",
    description: "Multi-select tag fields",
    fields: ["tags", "categories", "skills"],
  },
  {
    id: "selection-fields",
    label: "Selection Fields",
    description: "Dropdown selection fields",
    fields: ["status", "role", "priority"],
  },
  {
    id: "optional-fields",
    label: "Media & Optional",
    description: "Media uploads and optional fields",
    fields: ["bio", "avatar", "coverImage"],
  },
];

export default function AllFieldsExamplePage() {
  // Create an initial state with sample values
  const [formData, setFormData] = useState<Partial<AllFieldsType>>({
    title: "", // Empty to demonstrate validation
    description: "", // Empty to demonstrate validation
    email: "example@test.com",
    url: "https://example.com",
    age: 30,
    price: 99.99,
    rating: 4,
    active: true,
    featured: false,
    notifications: true,
    birthDate: new Date("1990-01-01"),
    createdAt: new Date("2023-01-01T12:00:00.000Z"), // Use stable date strings
    scheduledDate: new Date("2025-03-11T12:00:00.000Z"), // Use stable date strings
    expiryDate: new Date("2025-06-15T12:00:00.000Z"), // Use stable date strings
    tags: [], // Empty to demonstrate validation
    categories: ["technology", "business"],
    skills: ["javascript"],
    status: "published",
    role: "editor",
    priority: "medium",
    bio: "This is a sample biography text that demonstrates a longer form text field.",
    avatar: null,
    coverImage: null,
  });

  const handleSubmit = (data: AllFieldsType) => {
    setFormData(data);
    toast.success("Form submitted successfully!", {
      description: "Check the output panel for the submitted data",
    });
    console.log("Form data:", data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-10">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/test" className="text-muted-foreground hover:text-primary flex items-center gap-1 mb-4 transition-colors">
            <ArrowLeft size={16} />
            <span>Back to test page</span>
          </Link>
          
          <div className="flex items-center justify-center mb-2 gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-4xl font-bold text-center">All Field Types Example</h1>
          </div>
          <p className="text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
            This page demonstrates all available field types and renderers in a tabbed form layout.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div className="bg-card rounded-lg shadow-md p-6 border border-border">
            <TabbedSchemaForm<AllFieldsType>
              schema={AllFieldsSchema}
              defaultValues={formData as any}
              onSubmit={handleSubmit}
              fieldCustomizations={AllFieldsCustomizations}
              tabs={AllFieldsTabs}
              title="Complete Form Example"
              description="This form demonstrates all available field types and renderers"
              submitText="Save Form"
              showReset={true}
            />
          </div>

          <div className="bg-card rounded-lg shadow-md p-6 border border-border">
            <h2 className="text-2xl font-bold mb-4">Form Output</h2>
            <div className="bg-muted rounded-md overflow-hidden">
              <pre className="overflow-auto p-4 text-xs sm:text-sm whitespace-pre-wrap h-[600px]">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        <div className="mt-12 p-8 bg-card rounded-lg shadow-md border border-border">
          <h2 className="text-2xl font-bold mb-4">About This Example</h2>
          <p className="mb-4 text-muted-foreground">
            This example demonstrates how all field types render and function within a tabbed form layout. Each tab groups similar field types together for easier testing and comparison.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            <div>
              <h3 className="text-xl font-semibold mb-3">Features Demonstrated:</h3>
              <ul className="space-y-2">
                {[
                  "All basic field types (text, number, boolean)",
                  "Advanced field types (date, tags, select)",
                  "Media upload fields (image, avatar)",
                  "Optional and required field validation",
                  "Tabbed organization of related fields",
                  "Form reset and data persistence",
                  "Error indicators on tabs with validation errors",
                  "Automatic tab switch to first validation error"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-3">Validation Features:</h3>
              <ul className="space-y-2">
                {[
                  "Red badges on tabs indicate fields with errors",
                  "Automatic switch to the first tab with errors",
                  "Clear error messages for each field",
                  "Title requires 3-100 characters",
                  "Description requires 10-500 characters",
                  "Email must be a valid format",
                  "URL must be a valid web address",
                  "Age must be between 18-120",
                  "Tags require at least one item"
                ].map((renderer, index) => (
                  <li key={index} className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                    {renderer}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 