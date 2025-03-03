"use client";

import { useState } from "react";
import { toast } from "sonner";
import { SchemaForm } from "@/components/data-editing";
import { Example, ExampleType, ExampleGroups } from "@/features/example/types/example.type";
import { ExampleFields } from "@/features/example/types/example-fields";
import Link from "next/link";
import { ArrowLeft, FileCode } from "lucide-react";

export default function ComplexFormValidationPage() {
  // Create a sample example data without using the branded type directly
  const [formData, setFormData] = useState<Partial<ExampleType>>({
    title: "Example Title",
    subtitle: "Example Subtitle",
    content: "This is an example content text.",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  });

  const handleSubmit = (data: ExampleType) => {
    setFormData(data);
    toast.success("Complex form submitted successfully!", {
      description: "Check the console for the submitted data",
    });
    console.log("Complex form data:", data);
  };

  // Extract all fields from ExampleGroups
  const allFields = ExampleGroups.flatMap((tab) => tab.fields);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-10">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/test" className="text-muted-foreground hover:text-primary flex items-center gap-1 mb-4 transition-colors">
            <ArrowLeft size={16} />
            <span>Back to test page</span>
          </Link>
          
          <div className="flex items-center justify-center mb-2 gap-2">
            <FileCode size={24} className="text-primary" />
            <h1 className="text-4xl font-bold text-center">Complex Form Example</h1>
          </div>
          <p className="text-muted-foreground mb-8 text-center max-w-2xl mx-auto">
            This page demonstrates a more complex form using the ExampleType schema from the application.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <div className="bg-card rounded-lg shadow-md p-8 border border-border">
            <SchemaForm<ExampleType>
              schema={Example as any} // Use type assertion to avoid type issues
              defaultValues={formData as any} // Use type assertion for demo purposes
              onSubmit={handleSubmit}
              fieldCustomizations={ExampleFields}
              title="Example Entity"
              description="Edit the example entity with schema-based validation"
              submitText="Update Example"
              showReset={true}
              fields={allFields}
            />
          </div>

          <div className="bg-card rounded-lg shadow-md p-8 border border-border">
            <h2 className="text-2xl font-bold mb-4">Form Output</h2>
            <div className="bg-muted rounded-md overflow-hidden">
              <pre className="overflow-auto p-4 text-sm whitespace-pre-wrap h-[400px]">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
            
            <div className="mt-6 p-4 bg-muted/50 rounded-md border border-border">
              <h3 className="font-semibold mb-2">Example Schema Details</h3>
              <p className="text-sm text-muted-foreground">
                This example uses the application's built-in Example schema with its associated 
                field customizations. The schema includes validation for all fields.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 p-8 bg-card rounded-lg shadow-md border border-border">
          <h2 className="text-2xl font-bold mb-4">About This Complex Example</h2>
          <p className="mb-6 text-muted-foreground">
            This example demonstrates how to use the SchemaForm component with a complex schema from your actual application.
            It uses the ExampleType schema with all its fields and validation rules.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-3">Integration Features:</h3>
              <ul className="space-y-2">
                {[
                  "Integration with existing application schemas",
                  "Using field customizations from the application",
                  "Handling complex data types including dates",
                  "Selective field rendering based on tab groups"
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-3">Technical Implementation:</h3>
              <ul className="space-y-2">
                {[
                  "Uses the Effect schema for type safety",
                  "Field selection based on ExampleGroups",
                  "Type asserting for demo compatibility",
                  "Seamless validation with existing schemas",
                  "Reuses the field customizations from the app"
                ].map((detail, index) => (
                  <li key={index} className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                    {detail}
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