import { ExampleComponent } from "@/features/example/presentation";
import { TestQuery } from "@/features/example/tanstack/testQuery";

export default function TestPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Database Operations Test Page</h1>
    
      <TestQuery />
    </div>
  );
}
