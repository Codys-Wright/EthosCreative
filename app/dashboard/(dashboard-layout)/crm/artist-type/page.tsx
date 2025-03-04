"use client";

import React, { useState, useEffect } from "react";
import { TabbedSchemaForm } from "@/components/data-editing/tabbed-schema-form";
import { ArtistTypeFields, NewArtistTypeFields } from "@/features/artist-types/types/artist-fields";
import { 
  NewArtistType, 
  NewArtistTypeType, 
  ArtistTypeType,
  ArtistTypeGroups,
  ArtistType
} from "@/features/artist-types/types/artist-type.type";
import { Schema } from "effect";
import { TabDefinition } from "@/components/data-editing/schema-utils";
import { ArtistTypeHooks } from "@/features/artist-types/api/artist-type.hooks";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DataTable } from "@/components/crud/data-table";
import { artistTypeTableConfig } from "@/features/artist-types/config/artist-type-table.config";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Plus, ChevronDown, ChevronUp } from "lucide-react";

export default function ArtistTypePage() {
  // State for artist types data
  const [artistTypes, setArtistTypes] = useState<ArtistTypeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch artist types using hooks
  const { data: fetchedArtistTypes, isSuccess } = ArtistTypeHooks.useGetAll();
  const updateMutation = ArtistTypeHooks.useUpdate();
  const createMutation = ArtistTypeHooks.useCreate();
  const deleteMutation = ArtistTypeHooks.useDelete();
  
  // Initialize with data from API
  useEffect(() => {
    if (isSuccess && fetchedArtistTypes) {
      setArtistTypes(fetchedArtistTypes);
      setIsLoading(false);
    } else if (!isLoading && !fetchedArtistTypes?.length) {
      // Initialize with empty array if no data
      setArtistTypes([]);
      setIsLoading(false);
    }
  }, [fetchedArtistTypes, isSuccess, isLoading]);
  
  // Create tabs specifically for the NewArtistType schema
  const createTabs: TabDefinition<NewArtistTypeType>[] = [
    {
      id: "basic",
      label: "Basic Information",
      fields: ["title", "subtitle", "elevatorPitch"]
    },
    {
      id: "content",
      label: "Content",
      fields: ["description", "blog"]
    },
    {
      id: "metadata",
      label: "Metadata",
      fields: ["tags", "icon", "metadata", "version"]
    },
    {
      id: "notes",
      label: "Notes",
      fields: ["notes"]
    }
  ];
  
  // Update an artist type
  const updateArtistType = (updatedArtistType: ArtistTypeType) => {
    const { id, ...data } = updatedArtistType;
    updateMutation.mutate(
      { id, data },
      {
        onSuccess: () => {
          // Update local state
          setArtistTypes(prev => 
            prev.map(item => item.id === id ? updatedArtistType : item)
          );
          toast.success("Artist type updated successfully!");
        },
        onError: (error) => {
          console.error("Error updating artist type:", error);
          toast.error("Failed to update artist type");
        }
      }
    );
  };
  
  // Handle field updates
  const handleFieldUpdate = async (row: ArtistTypeType, field: keyof ArtistTypeType, value: any): Promise<boolean> => {
    try {
      const updatedArtistType = { ...row, [field]: value };
      updateArtistType(updatedArtistType);
      return true;
    } catch (error) {
      console.error("Error updating field:", error);
      toast.error("Failed to update field");
      return false;
    }
  };
  
  // Save artist type (create new or update existing)
  const saveArtistType = (data?: ArtistTypeType | NewArtistTypeType | Partial<NewArtistTypeType>): void => {
    if (!data) return;
    
    if ('id' in data && data.id) {
      // Update existing
      updateArtistType(data as ArtistTypeType);
    } else {
      // Create new
      createMutation.mutate(data as NewArtistTypeType, {
        onSuccess: (newArtistType) => {
          setArtistTypes(prev => [...prev, newArtistType as ArtistTypeType]);
          toast.success("Artist type created successfully!");
          // Reset form if visible
          if (showForm) {
            setShowForm(false);
          }
        },
        onError: (error) => {
          console.error("Error creating artist type:", error);
          toast.error("Failed to create artist type");
        }
      });
    }
  };
  
  // Delete artist type
  const deleteArtistType = async (artistType: ArtistTypeType) => {
    try {
      await deleteMutation.mutateAsync(artistType.id, {
        onSuccess: () => {
          setArtistTypes(prev => prev.filter(item => item.id !== artistType.id));
          toast.success("Artist type deleted successfully!");
        },
        onError: (error) => {
          console.error("Error deleting artist type:", error);
          toast.error("Failed to delete artist type");
        }
      });
      return true;
    } catch (error) {
      console.error("Error deleting artist type:", error);
      return false;
    }
  };
  
  // Handle form submission
  const handleSubmit = async (data: NewArtistTypeType) => {
    console.log("Form submitted with data:", data);
    
    // Add validation to ensure title is not null or empty string
    if (!data.title || data.title.trim() === "") {
      toast.error("Title is required and cannot be empty");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Call mutation to create the artist type
      await createMutation.mutateAsync(data, {
        onSuccess: (newArtistType) => {
          setArtistTypes(prev => [...prev, newArtistType as ArtistTypeType]);
          toast.success("Artist type created successfully!");
          setShowForm(false); // Hide form after successful submission
        },
        onError: (error) => {
          console.error("Error creating artist type:", error);
          toast.error("Failed to create artist type. Please try again.");
        }
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Default empty values for the form
  const defaultValues: Partial<NewArtistTypeType> = {
    title: "",
    subtitle: null,
    elevatorPitch: null,
    description: null,
    blog: null,
    tags: null,
    icon: null,
    metadata: null,
    notes: null,
    version: null
  };

  // Runtime props for the data table
  const runtimeProps = {
    onEdit: updateArtistType,
    onDelete: deleteArtistType,
    onCreateNew: saveArtistType,
    onFieldUpdate: handleFieldUpdate
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Artist Types</h1>
        <Button 
          variant="default" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Hide Form
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add New Artist Type
            </>
          )}
        </Button>
      </div>

      {/* Create Form Card */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Artist Type</CardTitle>
            <CardDescription>Fill out the form to create a new artist type</CardDescription>
          </CardHeader>
          <CardContent>
            <TabbedSchemaForm<NewArtistTypeType>
              schema={NewArtistType}
              defaultValues={defaultValues}
              fieldCustomizations={NewArtistTypeFields}
              tabs={createTabs}
              onSubmit={handleSubmit}
              submitText={isSubmitting ? "Creating..." : "Create Artist Type"}
              showReset={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Artist Types</CardTitle>
          <CardDescription>View and manage artist types</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <DataTable
              data={artistTypes}
              columns={artistTypeTableConfig.columns}
              title="Artist Types"
              description="Manage your artist types"
              useIntegratedEditor={true}
              createSchema={artistTypeTableConfig.createSchema}
              editSchema={artistTypeTableConfig.editSchema}
              tabs={ArtistTypeGroups}
              fieldCustomizations={ArtistTypeFields}
              {...runtimeProps}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
