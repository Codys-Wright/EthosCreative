export default function ExampleEditorPage() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-background py-10">
      <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-8">
        <h1 className="text-2xl font-bold">Example Editor</h1>
        <p className="text-sm text-muted-foreground mb-6 text-center max-w-3xl mx-auto">
          This example demonstrates how to use the generic editor component to
          create a new or edit an existing example.
        </p>
      </div>
    </div>
  );
}
