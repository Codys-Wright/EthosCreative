"use client";

import { useState, useEffect } from 'react';
import { Array } from 'effect';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, Table as TableIcon } from "lucide-react";

// Import all schemas and utilities from our schema directory
import {
  DataTypeSchema,
  NewDataTypeSchema,
  DataType,
  getFieldMetadata,
  formatValue,
  DataTypeId,
  getTabGroups
} from './schemas';

// Import our components
import { SchemaFormRenderer } from './components/SchemaFormRenderer';
import { SchemaDataTable } from './components/SchemaDataTable';

// Define our interface for data objects
interface DataItem {
  id: string;
  [key: string]: any;
}

// Create sample data (in a real app, this would come from an API)
const sampleData = Array.makeBy(10, (i) => {
  const id = `${i + 1}`;
  // Use a fixed base date for sample data
  const baseDate = new Date('2023-01-01T00:00:00Z');
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
    dateString: createdISOString.split('T')[0], // YYYY-MM-DD format
    nullableString: i % 3 === 0 ? null : `Optional text ${i}`,
    void: undefined,
    email: `user${i}@example.com`,
    createdAt: createdISOString,
    updatedAt: createdISOString
  };
});

// Data Card component for displaying items
interface DataCardProps {
  data: DataItem;
  onEdit: (data: DataItem) => void;
}

const DataCard = ({ data, onEdit }: DataCardProps) => {
  // Format field values for display
  const formatFieldValue = (fieldName: string, value: any): string => {
    if (value === null || value === undefined) return "-";
    if (value instanceof Date) return value.toLocaleDateString();
    
    // Use the schema's formatValue helper
    const metadata = getFieldMetadata(DataTypeSchema, fieldName);
    if (metadata) {
      return formatValue(value, metadata.type);
    }
    
    return String(value);
  };

  // Group fields by tab groups from schema
  const getFieldGroups = () => {
    const tabGroups = getTabGroups(DataTypeSchema);
    return Object.entries(tabGroups)
      .filter(([groupName]) => groupName !== 'system') // Optional: filter out system fields
      .map(([groupName, config]) => ({
        groupName,
        label: config.label,
        fields: config.fields.filter(field => field !== 'id') // Optional: filter out id field
      }));
  };
  
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>
          {data.stringValue || `Item ${data.id}`}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {getFieldGroups().map(group => (
          <div key={group.groupName} className="mb-4">
            <h3 className="text-sm font-medium mb-2">{group.label}</h3>
            <div className="space-y-1">
              {group.fields.map(field => (
                <div key={field} className="grid grid-cols-2 gap-2 text-sm">
                  <span className="font-medium">
                    {getFieldMetadata(DataTypeSchema, field)?.label || field}:
                  </span>
                  <span className="text-sm">{formatFieldValue(field, data[field])}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={() => onEdit(data)}
        >
          Edit
        </Button>
      </CardContent>
    </Card>
  );
};

// Main Page Component
export default function TestPage() {
  // State for managing data items
  const [data, setData] = useState<DataItem[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<DataItem | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  
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
      updatedAt: new Date().toISOString()
    };
    
    // Add to data array
    setData([...data, completeItem]);
    setIsCreating(false);
  };

  const handleEditSubmit = (updatedItem: Record<string, any>) => {
    // Make sure we have the id property
    if (!updatedItem.id) {
      console.error('Cannot update item without id');
      return;
    }
    
    // Create a properly typed complete item
    const completeItem: DataItem = {
      id: updatedItem.id,
      ...updatedItem,
      updatedAt: new Date().toISOString()
    };
    
    // Update in data array
    setData(data.map(item => item.id === completeItem.id ? completeItem : item));
    setIsEditing(false);
    setCurrentItem(null);
  };

  const startEditing = (item: DataItem) => {
    setCurrentItem(item);
    setIsEditing(true);
  };

  // Select fields to display in the table
  const displayFields = [
    'stringValue',
    'numberValue', 
    'booleanValue',
    'dateValue',
    'email'
  ];

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Data Type Test</h1>
      
      {/* Create/Edit Forms */}
      {isCreating && (
        <div className="mb-6">
          <SchemaFormRenderer
            schema={NewDataTypeSchema}
            schemaName="NewDataType"
            onSubmit={handleCreateSubmit}
            mode="create"
            title="Create New Item"
            description="Fill out the form to create a new item."
          />
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setIsCreating(false)}
          >
            Cancel
          </Button>
        </div>
      )}
      
      {isEditing && currentItem && (
        <div className="mb-6">
          <SchemaFormRenderer
            schema={DataTypeSchema}
            schemaName="DataType"
            initialData={currentItem}
            onSubmit={handleEditSubmit}
            mode="edit"
            title={`Edit ${currentItem.stringValue || `Item ${currentItem.id}`}`}
            description="Update the item details."
          />
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setIsEditing(false);
              setCurrentItem(null);
            }}
          >
            Cancel
          </Button>
        </div>
      )}
      
      {/* Actions Bar */}
      {!isCreating && !isEditing && (
        <div className="mb-6 flex items-center justify-between">
          <Button 
            onClick={() => setIsCreating(true)}
          >
            Create New Item
          </Button>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">View mode:</span>
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'table' | 'cards')}>
              <TabsList>
                <TabsTrigger value="table" className="flex items-center gap-1">
                  <TableIcon className="h-4 w-4" />
                  <span>Table</span>
                </TabsTrigger>
                <TabsTrigger value="cards" className="flex items-center gap-1">
                  <LayoutGrid className="h-4 w-4" />
                  <span>Cards</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      )}
      
      {/* Data Display */}
      {!isCreating && !isEditing && (
        <>
          {/* Table View */}
          {viewMode === 'table' && (
            <SchemaDataTable
              data={data}
              schema={DataTypeSchema}
              title="Data Items"
              description="A list of all data items in the system"
              displayFields={displayFields}
              onEdit={startEditing}
              searchPlaceholder="Search items..."
            />
          )}
          
          {/* Card View */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.map(item => (
                <DataCard
                  key={item.id}
                  data={item}
                  onEdit={startEditing}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
