"use client";

import { useState, useEffect } from "react";
import { Array } from "effect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Import all schemas and utilities from our schema directory
import { DataTypeSchema, NewDataTypeSchema } from "./schemas";

// Import our components
import { SchemaFormRenderer } from "./components/SchemaFormRenderer";
import { SchemaDataTable } from "./components/SchemaDataTable";

// Define our interface for data objects
interface DataItem {
  id: string;
  [key: string]: any;
}

// Create sample data (in a real app, this would come from an API)
const sampleData = Array.makeBy(10, (i) => {
  const id = `${i + 1}`;
  // Use a fixed base date for sample data
  const baseDate = new Date("2023-01-01T00:00:00Z");
  // Add days to create different dates for each item
  const createdDate = new Date(baseDate.getTime());
  createdDate.setDate(baseDate.getDate() + i);
  const createdISOString = createdDate.toISOString();

  // Basic data object with all required fields
  return {
    id: id,
    stringValue: `Sample text ${i}`,
    numberValue: i * 10,
    booleanValue: i % 2 === 0,
    dateValue: new Date(createdISOString),
    dateString: createdISOString.split("T")[0], // YYYY-MM-DD format
    nullableString: i % 3 === 0 ? null : `Optional text ${i}`,
    void: undefined,
    email: `user${i}@example.com`,
    createdAt: createdISOString,
    updatedAt: createdISOString,
  };
});

// Main Page Component
export default function TestPage() {
  // State for managing data items
  const [data, setData] = useState<DataItem[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<DataItem | null>(null);

  // Load sample data on component mount
  useEffect(() => {
    setData(sampleData);
  }, []);

  // Form submission handlers - these now simply update the state with the data
  // from the form, with no additional processing needed
  const handleCreateSubmit = (newItem: Record<string, any>) => {
    // Add system fields in a real app, these would be handled by the backend
    const completeItem = {
      ...newItem,
      id: String(data.length + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to data array
    setData([...data, completeItem]);
    setIsCreateDialogOpen(false);
  };

  const handleEditSubmit = (updatedItem: Record<string, any>) => {
    // Make sure we have the id property
    if (!updatedItem.id) {
      console.error("Cannot update item without id");
      return;
    }

    // Create a properly typed complete item
    const completeItem: DataItem = {
      id: updatedItem.id,
      ...updatedItem,
      updatedAt: new Date().toISOString(),
    };

    // Update in data array
    setData(
      data.map((item) => (item.id === completeItem.id ? completeItem : item)),
    );
    setIsEditDialogOpen(false);
    setCurrentItem(null);
  };

  const startEditing = (item: DataItem) => {
    setCurrentItem(item);
    setIsEditDialogOpen(true);
  };

  const startCreating = () => {
    setIsCreateDialogOpen(true);
  };

  // Select fields to display in the table
  const displayFields = [
    "stringValue",
    "numberValue",
    "booleanValue",
    "dateValue",
    "email",
  ];

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Data Type Test</h1>

      {/* Data Table */}
      <SchemaDataTable
        data={data}
        schema={DataTypeSchema}
        title="Data Items"
        description="A list of all data items in the system"
        displayFields={displayFields}
        onEdit={startEditing}
        onCreateNew={startCreating}
        searchPlaceholder="Search items..."
        pageSize={5}
      />

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Item</DialogTitle>
            <DialogDescription>
              Fill out the form to create a new item.
            </DialogDescription>
          </DialogHeader>
          <SchemaFormRenderer
            schema={NewDataTypeSchema}
            schemaName="NewDataType"
            onSubmit={handleCreateSubmit}
            mode="create"
            title=""
            description=""
          />
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              className="mr-2"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {currentItem
                ? `Edit ${currentItem.stringValue || `Item ${currentItem.id}`}`
                : "Edit Item"}
            </DialogTitle>
            <DialogDescription>Update the item details.</DialogDescription>
          </DialogHeader>
          {currentItem && (
            <SchemaFormRenderer
              schema={DataTypeSchema}
              schemaName="DataType"
              initialData={currentItem}
              onSubmit={handleEditSubmit}
              mode="edit"
              title=""
              description=""
            />
          )}
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setCurrentItem(null);
              }}
              className="mr-2"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
