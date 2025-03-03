"use client";

import { useState } from "react";
import { Schema as S } from "effect";
import { toast } from "sonner";
import { SchemaForm } from "@/components/data-editing";
import { FieldCustomizationRecord } from "@/components/crud/field-types";
import Link from "next/link";
import { ArrowLeft, Layers } from "lucide-react";

// Define a schema with fields that will use our specialized renderers
const ContentSchema = S.Struct({
  title: S.String,
  subtitle: S.NullOr(S.String),
  slug: S.String,
  tags: S.Array(S.String),
  categories: S.Array(S.String),
  profilePicture: S.NullOr(S.String),
  authorAvatar: S.NullOr(S.String),
  thumbnailImage: S.NullOr(S.String),
  coverImage: S.NullOr(S.String),
  content: S.String,
  shortDescription: S.NullOr(S.String),
  status: S.Literal("draft", "published", "archived", "scheduled"),
  publishDate: S.NullOr(S.DateFromSelf),
  scheduledDate: S.NullOr(S.DateFromSelf),
  expiryDate: S.NullOr(S.DateFromSelf),
  featured: S.Boolean,
  isPremium: S.Boolean
});

// Define a type from the schema
type ContentType = typeof ContentSchema.Type;

// Define field customizations
const ContentFields: FieldCustomizationRecord<ContentType> = {
  title: {
    label: "Content Title",
    placeholder: "Enter a title",
    description: "The main title of your content item",
    required: true,
  },
  subtitle: {
    label: "Subtitle",
    placeholder: "Enter a subtitle (optional)",
    description: "A secondary title for the content",
  },
  slug: {
    label: "URL Slug",
    placeholder: "url-friendly-slug",
    description: "The URL-friendly identifier for this content",
    required: true,
  },
  tags: {
    type: "combobox",
    label: "Tags",
    placeholder: "Add tags",
    description: "Tags to categorize this content",
  },
  categories: {
    type: "combobox",
    label: "Categories",
    placeholder: "Add categories",
    description: "Categories for this content",
  },
  profilePicture: {
    type: "avatar",
    label: "Author Picture",
    description: "Profile picture of the content author",
  },
  authorAvatar: {
    // This will use the avatar renderer based on the field name
    label: "Content Creator Avatar",
    description: "Avatar of the content creator",
  },
  thumbnailImage: {
    type: "image",
    label: "Thumbnail",
    description: "Featured image for this content",
  },
  coverImage: {
    // This will use the image renderer based on the field name
    label: "Cover Image",
    description: "Banner image for the content",
  },
  content: {
    type: "richtext",
    label: "Main Content",
    placeholder: "Write your content here...",
    description: "The main content body",
    required: true,
  },
  shortDescription: {
    type: "textarea",
    label: "Short Description",
    placeholder: "Brief summary of the content",
    description: "A short description for previews and search results",
  },
  status: {
    type: "select",
    label: "Publication Status",
    description: "Current status of this content",
    options: [
      { label: "Draft", value: "draft" },
      { label: "Published", value: "published" },
      { label: "Archived", value: "archived" },
      { label: "Scheduled", value: "scheduled" },
    ],
    required: true,
  },
  publishDate: {
    type: "date",
    label: "Publish Date",
    description: "When this content was published",
  },
  scheduledDate: {
    type: "date",
    label: "Schedule For",
    description: "When to publish this content (if scheduled)",
  },
  expiryDate: {
    type: "date",
    label: "Expiry Date",
    description: "When this content should be automatically archived",
  },
  featured: {
    type: "checkbox",
    label: "Featured Content",
    description: "Whether this content should be featured on the homepage",
  },
  isPremium: {
    type: "checkbox",
    label: "Premium Content",
    description: "Whether this content is for premium subscribers only",
  }
};

export default function CustomFieldsPage() {
  const [formData, setFormData] = useState<Partial<ContentType>>({
    title: "",
    subtitle: null,
    slug: "",
    tags: [],
    categories: [],
    profilePicture: null,
    authorAvatar: null,
    thumbnailImage: null,
    coverImage: null,
    content: "",
    shortDescription: null,
    status: "draft",
    publishDate: null,
    scheduledDate: null,
    expiryDate: null,
    featured: false,
    isPremium: false
  });

  const handleSubmit = (data: ContentType) => {
    setFormData(data);
    toast.success("Form submitted successfully!", {
      description: "Check the output below for the submitted data",
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
            <Layers size={24} className="text-primary" />
            <h1 className="text-4xl font-bold text-center">Custom Field Renderers</h1>
          </div>
          <p className="text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
            This page demonstrates specialized field renderers that automatically handle different field types.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 items-start">
          <div className="md:col-span-3 bg-card rounded-lg shadow-md p-8 border border-border">
            <SchemaForm<ContentType>
              schema={ContentSchema}
              defaultValues={formData as any}
              onSubmit={handleSubmit}
              fieldCustomizations={ContentFields}
              title="Content Editor"
              description="Edit content with specialized field types"
              submitText="Save Content"
              showReset={true}
              fields={[
                // Basic Info Section
                "title", "subtitle", "slug", "shortDescription",
                
                // Media Section
                "profilePicture", "authorAvatar", "thumbnailImage", "coverImage",
                
                // Content Section
                "content",
                
                // Classification Section
                "tags", "categories", "featured", "isPremium",
                
                // Publication Section
                "status", "publishDate", "scheduledDate", "expiryDate",
              ]}
            />
          </div>

          <div className="md:col-span-2 bg-card rounded-lg shadow-md p-8 border border-border">
            <h2 className="text-2xl font-bold mb-4">Form Output</h2>
            <div className="bg-muted rounded-md overflow-hidden">
              <pre className="overflow-auto p-4 text-sm whitespace-pre-wrap h-[500px]">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        <div className="mt-12 p-8 bg-card rounded-lg shadow-md border border-border">
          <h2 className="text-2xl font-bold mb-4">About Field Renderers</h2>
          <p className="mb-6 text-muted-foreground">
            Field renderers allow you to automatically map field names to specialized UI components.
            The system can detect common field patterns by name (like "avatar" or "image") and apply appropriate UI.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">Supported Field Types:</h3>
              <ul className="space-y-2">
                {[
                  "Combobox for tags input",
                  "Image uploads with preview",
                  "Avatar uploads with fallback to initials",
                  "Rich text editing for content fields",
                  "All standard form fields (text, number, etc.)"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-3">Automatic Field Detection:</h3>
              <ul className="space-y-2">
                {[
                  "Fields named 'tags' become tag inputs",
                  "Fields like 'profile_picture' become avatar uploads",
                  "Fields like 'image' or 'thumbnail' become image uploads",
                  "Fields like 'content' or 'description' become rich text editors",
                  "Override with explicit 'type' in field customizations"
                ].map((use, index) => (
                  <li key={index} className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                    {use}
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