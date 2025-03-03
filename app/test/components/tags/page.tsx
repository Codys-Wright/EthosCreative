"use client";

import { useState } from "react";
import { Tags } from "@/components/ui/tags";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Define some example tags
const EXAMPLE_TAGS = [
  { id: "technology", label: "Technology" },
  { id: "science", label: "Science" },
  { id: "arts", label: "Arts" },
  { id: "sports", label: "Sports" },
  { id: "music", label: "Music" },
  { id: "literature", label: "Literature" },
  { id: "travel", label: "Travel" },
  { id: "cooking", label: "Cooking" },
  { id: "photography", label: "Photography" },
  { id: "design", label: "Design" },
  { id: "education", label: "Education" },
  { id: "business", label: "Business" },
  { id: "health", label: "Health" },
  { id: "environment", label: "Environment" },
];

export default function TagsComponentDemo() {
  const [selectedTags, setSelectedTags] = useState<string[]>(["technology", "science"]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/test" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Test Examples
          </Link>
          <h1 className="text-4xl font-bold mb-2 text-center">Tags Component Demo</h1>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto">
            A reusable component for selecting multiple tags from a list of options with search functionality.
          </p>
        </div>

        <div className="grid gap-12">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="bg-card rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4">Basic Example</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Interests</label>
                    <Tags
                      value={selectedTags}
                      onChange={setSelectedTags}
                      placeholder="Search and select tags..."
                      suggestions={EXAMPLE_TAGS}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedTags([])}
                      className="mr-2"
                    >
                      Clear All
                    </Button>
                    <Button 
                      onClick={() => {
                        // Select random 3 tags
                        const randomTags = [...EXAMPLE_TAGS]
                          .sort(() => 0.5 - Math.random())
                          .slice(0, 3)
                          .map(tag => tag.id);
                        setSelectedTags(randomTags);
                      }}
                    >
                      Random Selection
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4">How It Works</h2>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    This tags component offers an elegant way to select multiple tags:
                  </p>
                  <ul className="space-y-2 text-sm list-disc pl-5">
                    <li>Click on the input field to see tag suggestions</li>
                    <li>Type to filter available tags</li>
                    <li>Use arrow keys to navigate suggestions</li>
                    <li>Press Enter to select the highlighted tag</li>
                    <li>Click the "×" icon on a tag to remove it</li>
                    <li>Press Backspace in an empty input to remove the last tag</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-card rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4">Code Example</h2>
                <pre className="text-sm bg-muted-foreground/5 p-4 rounded-md overflow-auto max-h-[400px]">
{`import { Tags } from "@/components/ui/tags";

// Define your tags
const tags = [
  { id: "tech", label: "Technology" },
  { id: "science", label: "Science" },
  // ...more tags
];

// Component usage
const [selectedTags, setSelectedTags] = useState<string[]>([]);

return (
  <Tags
    value={selectedTags}
    onChange={setSelectedTags}
    placeholder="Search and select tags..."
    suggestions={tags}
  />
);`}
                </pre>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-muted rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Selected Tags</h2>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.length > 0 ? (
                      selectedTags.map(tagId => {
                        const tag = EXAMPLE_TAGS.find(t => t.id === tagId);
                        return (
                          <div key={tagId} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                            {tag?.label || tagId}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-muted-foreground">No tags selected</p>
                    )}
                  </div>
                  
                  <pre className="text-sm bg-muted-foreground/5 p-4 rounded-md overflow-auto">
                    {JSON.stringify(selectedTags, null, 2)}
                  </pre>
                </div>
              </div>
              
              <div className="bg-card rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4">Features</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted p-3 rounded-md text-sm">
                      <h3 className="font-medium mb-2">Keyboard Navigation</h3>
                      <p className="text-muted-foreground">Use arrow keys and Enter to efficiently select tags without touching your mouse.</p>
                    </div>
                    <div className="bg-muted p-3 rounded-md text-sm">
                      <h3 className="font-medium mb-2">Search Filtering</h3>
                      <p className="text-muted-foreground">Type to instantly filter the available tags, making it easy to find what you need.</p>
                    </div>
                    <div className="bg-muted p-3 rounded-md text-sm">
                      <h3 className="font-medium mb-2">Animations</h3>
                      <p className="text-muted-foreground">Smooth animations when adding and removing tags enhance the user experience.</p>
                    </div>
                    <div className="bg-muted p-3 rounded-md text-sm">
                      <h3 className="font-medium mb-2">Customizable</h3>
                      <p className="text-muted-foreground">Easily adjust the appearance and behavior to match your application's needs.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-card rounded-lg shadow-sm border p-6">
                <h2 className="text-xl font-semibold mb-4">Component Props</h2>
                <div className="space-y-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left pb-2 font-medium">Prop</th>
                        <th className="text-left pb-2 font-medium">Type</th>
                        <th className="text-left pb-2 font-medium">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="py-2 font-mono text-xs">value</td>
                        <td className="py-2 text-muted-foreground">string[]</td>
                        <td className="py-2 text-muted-foreground">Array of selected tag IDs</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-xs">onChange</td>
                        <td className="py-2 text-muted-foreground">function</td>
                        <td className="py-2 text-muted-foreground">Handler for when selection changes</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-xs">suggestions</td>
                        <td className="py-2 text-muted-foreground">array</td>
                        <td className="py-2 text-muted-foreground">Available tags with id and label</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-xs">placeholder</td>
                        <td className="py-2 text-muted-foreground">string</td>
                        <td className="py-2 text-muted-foreground">Placeholder text for empty input</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-xs">disabled</td>
                        <td className="py-2 text-muted-foreground">boolean</td>
                        <td className="py-2 text-muted-foreground">Whether the input is disabled</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-xs">limit</td>
                        <td className="py-2 text-muted-foreground">number</td>
                        <td className="py-2 text-muted-foreground">Maximum number of tags allowed</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 