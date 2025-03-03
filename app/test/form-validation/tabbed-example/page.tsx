"use client";

import { useState } from "react";
import { Schema as S } from "effect";
import { toast } from "sonner";
import { TabbedSchemaForm, TabDefinition } from "@/components/data-editing";
import { FieldCustomization } from "@/components/crud/field-types";
import Link from "next/link";
import { ArrowLeft, LayoutGrid } from "lucide-react";

// Define our schema using Effect.Schema
const ProfileSchema = S.Struct({
  // Personal Information
  firstName: S.String,
  lastName: S.String,
  email: S.String.pipe(S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  age: S.Number.pipe(S.between(18, 100)),
  bio: S.String,
  
  // Preferences
  theme: S.Literal("light", "dark", "system"),
  notificationsEnabled: S.Boolean,
  interests: S.Array(S.String), // Tags field

  // Account Details
  username: S.String,
  password: S.String,
  confirmPassword: S.String,
});

// Create a type from the schema
type ProfileType = {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  bio: string;
  theme: "light" | "dark" | "system";
  notificationsEnabled: boolean;
  interests: string[];
  username: string;
  password: string;
  confirmPassword: string;
};

// Define field customizations for each form field
const fieldCustomizations: Record<string, FieldCustomization> = {
  // Personal Information
  firstName: { 
    label: "First Name", 
    placeholder: "Enter your first name", 
    required: true 
  },
  lastName: { 
    label: "Last Name", 
    placeholder: "Enter your last name", 
    required: true 
  },
  email: { 
    label: "Email Address", 
    placeholder: "your@email.com", 
    description: "We'll never share your email with anyone else.", 
    required: true 
  },
  age: { 
    label: "Age", 
    placeholder: "Your age", 
    type: "number", 
    description: "Must be between 18 and 100." 
  },
  bio: { 
    label: "Biography", 
    placeholder: "Tell us about yourself", 
    type: "textarea", 
    description: "A brief description about yourself." 
  },
  
  // Preferences
  theme: { 
    label: "Theme Preference", 
    type: "select", 
    options: [
      { value: "light", label: "Light" },
      { value: "dark", label: "Dark" },
      { value: "system", label: "System Default" }
    ] 
  },
  notificationsEnabled: { 
    label: "Enable Notifications", 
    type: "checkbox", 
    description: "Receive notifications about account updates." 
  },
  interests: {
    label: "Interests",
    placeholder: "Select or create interests",
    description: "Choose topics you're interested in or type your own",
    type: "tags" as any,
    options: [
      { value: "technology", label: "Technology" },
      { value: "science", label: "Science" },
      { value: "arts", label: "Arts" },
      { value: "sports", label: "Sports" },
      { value: "music", label: "Music" },
      { value: "literature", label: "Literature" },
      { value: "travel", label: "Travel" },
      { value: "cooking", label: "Cooking" },
      { value: "gaming", label: "Gaming" },
      { value: "photography", label: "Photography" },
      { value: "history", label: "History" },
      { value: "nature", label: "Nature" },
      { value: "fashion", label: "Fashion" },
      { value: "movies", label: "Movies" },
      { value: "education", label: "Education" },
      { value: "business", label: "Business" },
    ]
  },
  
  // Account Details
  username: { 
    label: "Username", 
    placeholder: "Choose a username", 
    required: true,
    description: "Your unique username for this platform."
  },
  password: { 
    label: "Password", 
    placeholder: "Enter password", 
    type: "text" as any, // Will render as password in the UI
    required: true,
    description: "Choose a strong password."
  },
  confirmPassword: { 
    label: "Confirm Password", 
    placeholder: "Confirm your password", 
    type: "text" as any, // Will render as password in the UI
    required: true,
    description: "Enter the same password again."
  }
};

// Define tabs for the form
const tabs: TabDefinition<ProfileType>[] = [
  {
    id: "personal",
    label: "Personal Information",
    fields: ["firstName", "lastName", "email", "age", "bio"]
  },
  {
    id: "preferences",
    label: "Preferences",
    fields: ["theme", "notificationsEnabled", "interests"]
  },
  {
    id: "account",
    label: "Account Details",
    fields: ["username", "password", "confirmPassword"]
  }
];

export default function TabbedFormValidationPage() {
  const [formData, setFormData] = useState<Partial<ProfileType>>({
    theme: "system",
    notificationsEnabled: true,
    interests: ["technology", "science", "music"], // Default interests with an expanded selection
  });

  const handleSubmit = (values: ProfileType) => {
    toast.success("Form submitted successfully!");
    console.log("Form values:", values);
    setFormData(values);
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
            <LayoutGrid size={24} className="text-primary" />
            <h1 className="text-4xl font-bold text-center">Tabbed Form Validation</h1>
          </div>
          <p className="text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
            This page demonstrates a tabbed form with field grouping and required field indicators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 items-start">
          <div className="md:col-span-3 bg-card rounded-lg shadow-md p-8 border border-border">
            <TabbedSchemaForm
              schema={ProfileSchema as any}
              onSubmit={handleSubmit}
              defaultValues={formData}
              fieldCustomizations={fieldCustomizations}
              tabs={tabs}
              title="User Profile"
              description="Update your profile information in the relevant sections"
              submitText="Save Profile"
              showReset={true}
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
          <h2 className="text-2xl font-bold mb-4">About Tabbed Forms</h2>
          <p className="mb-6 text-muted-foreground">
            The TabbedSchemaForm component organizes form fields into tabs for better user experience 
            with complex forms. Each tab includes an indicator showing the number of required fields.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">Key Features:</h3>
              <ul className="space-y-2">
                {[
                  "Organize fields into logical groups with tabs",
                  "Required field indicators in tab headers",
                  "Optional tab descriptions",
                  "Full validation across all tabs",
                  "Same schema-based generation as the basic form"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-3">When to Use:</h3>
              <ul className="space-y-2">
                {[
                  "Forms with many fields that need organization",
                  "When fields naturally group into categories",
                  "Complex user profiles or settings pages",
                  "Forms that would otherwise be too long to scroll",
                  "When you want to guide users through logical sections"
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