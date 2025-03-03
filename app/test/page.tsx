"use client";

import Link from "next/link";
import { 
  BookOpen, 
  LayoutList, 
  FileInput, 
  LayoutGrid, 
  CheckSquare, 
  Copy,
  Layers,
  Tag,
  Hash
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-12">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-3">Component Test Gallery</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore and test different components and features. Each example demonstrates different capabilities and integration options.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <ExampleCard 
            title="Form Validation"
            description="Schema-based form generation and validation with Effect schemas"
            icon={<FileInput className="h-5 w-5" />}
            href="/test/form-validation"
          />
          
          <ExampleCard 
            title="Tabbed Form Example"
            description="Advanced forms with tabs and required field indicators"
            icon={<LayoutGrid className="h-5 w-5" />}
            href="/test/form-validation/tabbed-example"
          />
          
          <ExampleCard 
            title="Tags Component Demo"
            description="Interactive tags input with suggestions and auto-completion"
            icon={<Hash className="h-5 w-5" />}
            href="/test/components/tags"
          />
          
          <ExampleCard 
            title="Complex Form Example"
            description="Integration with application schemas and customizations"
            icon={<Copy className="h-5 w-5" />}
            href="/test/form-validation/complex-example"
          />
          
          <ExampleCard 
            title="Custom Field Renderers"
            description="Specialized UI components for different field types"
            icon={<Layers className="h-5 w-5" />}
            href="/test/form-validation/custom-fields"
          />
          
          <ExampleCard 
            title="Table Example"
            description="Basic table functionalities and interactions"
            icon={<LayoutList className="h-5 w-5" />}
            href="/test/table"
          />
          
          <ExampleCard 
            title="Example Table"
            description="Table component with application data"
            icon={<CheckSquare className="h-5 w-5" />}
            href="/test/example-table"
          />
        </div>
      
        <div className="bg-card rounded-lg shadow-md p-8 border border-border">
          <div className="flex items-start gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-4">About Schema Form</h2>
              <p className="mb-4 text-muted-foreground">
                The Schema Form components allow you to automatically generate forms from Effect schemas with validation.
                They provide both simple and tabbed interfaces for creating forms with proper validation.
              </p>
              
              <h3 className="text-lg font-semibold mb-3">Features:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
                {[
                  "Automatic form generation from Effect schemas",
                  "Field validation based on schema rules",
                  "Customizable field appearance and behavior",
                  "Support for various field types (text, number, textarea, checkbox, select)",
                  "Tab organization for complex forms",
                  "Required field indicators in tab headers",
                  "Easy integration with existing schemas"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mt-8 mb-4">UI Components</h2>
        <ul className="space-y-2">
          <li>
            <Link href="/test/components/tags" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-2">
              <span className="bg-blue-100 dark:bg-blue-900/40 p-1 rounded">
                <Tag className="h-4 w-4" />
              </span>
              Tags Component
              <Badge variant="outline" className="ml-2">New</Badge>
            </Link>
            <p className="text-sm text-muted-foreground ml-8">Multi-select tags input with search functionality.</p>
          </li>
          {/* Add more component examples here */}
        </ul>
      </div>
    </div>
  );
}

function ExampleCard({ 
  title, 
  description, 
  icon, 
  href 
}: { 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  href: string 
}) {
  return (
    <Link 
      href={href} 
      className="bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-all p-6 flex flex-col h-full"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-primary/10 p-2 rounded-full">
          {icon}
        </div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}
