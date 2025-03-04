"use client";

import { useState } from "react";
import { Schema as S } from "effect";
import { toast } from "sonner";
import { SchemaForm } from "@/components/data-editing";
import { FieldCustomizationRecord } from "@/components/crud/field-types";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Define a schema for our form using Effect.Schema
const UserSchema = S.Struct({
  name: S.String,
  email: S.String.pipe(S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  age: S.Number.pipe(S.between(18, 120)),
  bio: S.NullOr(S.String),
  newsletter: S.Boolean,
  interests: S.Array(S.String),
});

// Define a type from the schema
type UserType = typeof UserSchema.Type;

// Define field customizations
const UserFields: FieldCustomizationRecord<UserType> = {
  name: {
    label: "Full Name",
    placeholder: "Enter your full name",
    description: "Your first and last name",
    required: true,
  },
  email: {
    label: "Email Address",
    placeholder: "your.email@example.com",
    description: "We'll never share your email with anyone else",
    required: true,
  },
  age: {
    type: "number",
    label: "Age",
    placeholder: "Enter your age",
    description: "You must be at least 18 years old",
    required: true,
  },
  bio: {
    type: "textarea",
    label: "Biography",
    placeholder: "Tell us about yourself",
    description: "A short description about yourself (optional)",
    required: false,
  },
  newsletter: {
    type: "checkbox",
    label: "Subscribe to Newsletter",
    description: "Receive updates about our products and services",
    placeholder: "Subscribe to newsletter",
    required: false,
  },
  interests: {
    type: "tags" as any,
    label: "Interests",
    placeholder: "Select or create interests",
    description: "Select topics you're interested in or type your own",
    required: false,
    options: [
      { id: "technology", label: "Technology" },
      { id: "science", label: "Science" },
      { id: "arts", label: "Arts" },
      { id: "sports", label: "Sports" },
      { id: "music", label: "Music" },
      { id: "literature", label: "Literature" },
      { id: "travel", label: "Travel" },
      { id: "cooking", label: "Cooking" },
      { id: "gaming", label: "Gaming" },
      { id: "photography", label: "Photography" },
      { id: "history", label: "History" },
      { id: "nature", label: "Nature" },
      { id: "fashion", label: "Fashion" },
      { id: "movies", label: "Movies" },
      { id: "education", label: "Education" },
      { id: "business", label: "Business" }
    ] as any
  },
};

export default function FormValidationTestPage() {
  const [formData, setFormData] = useState<UserType>({
    name: "",
    email: "",
    age: 30,
    bio: null,
    newsletter: false,
    interests: ["technology", "science"],
  });

  const handleSubmit = (data: UserType) => {
    setFormData(data);
    toast.success("Form submitted successfully!", {
      description: "Check the console for the submitted data",
    });
    console.log("Form data:", data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-10">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/test" className="text-muted-foreground hover:text-primary flex items-center gap-1 mb-4 transition-colors">
            <ArrowLeft size={16} />
            <span>Back to test page</span>
          </Link>
          
          <h1 className="text-4xl font-bold mb-2 text-center">Form Validation</h1>
          <p className="text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
            This page demonstrates a form that is automatically generated and validated based on an Effect schema.
          </p>
        </div>

        {/* Form section */}
        <div className="bg-card rounded-lg shadow-md p-8 border border-border mb-10">
          <SchemaForm<UserType>
            schema={UserSchema}
            defaultValues={formData}
            onSubmit={handleSubmit}
            fieldCustomizations={UserFields}
            title="User Information"
            description="Please fill out the form below with your information"
            submitText="Save User"
            showReset={true}
          />
        </div>

        {/* Form output section */}
        <div className="bg-card rounded-lg shadow-md p-8 border border-border">
          <h2 className="text-2xl font-bold mb-4">Form Output</h2>
          <div className="bg-muted rounded-md overflow-hidden">
            <pre className="overflow-auto p-4 text-sm whitespace-pre-wrap h-[300px]">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        </div>

        <div className="mt-12 p-8 bg-card rounded-lg shadow-md border border-border">
          <h2 className="text-2xl font-bold mb-4">About This Example</h2>
          <p className="mb-4 text-muted-foreground">
            This example demonstrates how to create a form that is automatically generated from an Effect schema. 
            The form includes validation for all fields according to the schema rules.
          </p>
          <h3 className="text-xl font-semibold mb-3">Features:</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "Automatic form generation from schema",
              "Field validation based on schema rules",
              "Customizable field appearance and behavior",
              "Reset button to clear the form",
              "Immediately shows form output",
              "Supports text, number, checkbox, textarea, and tags fields"
            ].map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-primary"></span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 