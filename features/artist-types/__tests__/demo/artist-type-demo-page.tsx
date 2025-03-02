"use client";

import React, { useState, useEffect } from "react";
import { ArtistTypeHooks } from "@/features/artist-types/api/artist-type.hooks";
import { ArtistTypeType, NewArtistTypeType, ArtistTypeGroups } from "@/features/artist-types/types/artist-type.type";
import { DataTable, DataTableProps } from "@/components/crud/data-table";
import { artistTypeTableConfig, artistTypeTableBaseProps, ArtistTypeTableProps, ArtistTypeTableRuntimeProps } from "@/features/artist-types/config/artist-type-table.config";
import { generateNewArtistType, sampleArtistTypes } from "../generators/generateArtistTypeData";
import { ArtistTypeFields } from "@/features/artist-types/types/artist-fields";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/features/global/lib/utils/tanstack-query";

export default function ArtistTypeDemoPage() {
  // State to store artist types data
  const [artistTypes, setArtistTypes] = useState<ArtistTypeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Use hooks from ArtistTypeHooks
  const { data: fetchedArtistTypes, isSuccess } = ArtistTypeHooks.useGetAll();
  const updateMutation = ArtistTypeHooks.useUpdate();
  const createMutation = ArtistTypeHooks.useCreate();
  const deleteMutation = ArtistTypeHooks.useDelete();

  // Initialize with sample data if API doesn't return data
  useEffect(() => {
    if (isSuccess && fetchedArtistTypes) {
      setArtistTypes(fetchedArtistTypes);
      setIsLoading(false);
    } else if (!isLoading && !fetchedArtistTypes) {
      // If API call completed but no data, use sample data
      setArtistTypes(sampleArtistTypes);
      setIsLoading(false);
    }
  }, [fetchedArtistTypes, isSuccess, isLoading]);

  // Function to update an artist type
  const updateArtistType = (updatedArtistType: ArtistTypeType) => {
    const { id, ...data } = updatedArtistType;
    
    // Remove timestamps from the update data
    const { createdAt, updatedAt, deletedAt, ...updateData } = data;
    
    // Call the update mutation
    updateMutation.mutate(
      { id, data: updateData as Partial<NewArtistTypeType> },
      {
        onSuccess: () => {
          setArtistTypes(prev => 
            prev.map(at => at.id === id ? updatedArtistType : at)
          );
        }
      }
    );
  };

  // Function to handle field update (for inline editing)
  const handleFieldUpdate = async (row: ArtistTypeType, field: keyof ArtistTypeType, value: any): Promise<boolean> => {
    try {
      const { id } = row;
      
      // Create update data with just the changed field
      const updateData = { [field]: value } as Partial<NewArtistTypeType>;
      
      // Update locally for immediate feedback
      setArtistTypes(prev => 
        prev.map(at => at.id === id ? { ...at, [field]: value } : at)
      );
      
      // Call the update mutation
      updateMutation.mutate({ id, data: updateData });
      
      return true;
    } catch (error) {
      console.error("Error updating field:", error);
      return false;
    }
  };

  // Function to save artist type (create or update)
  const saveArtistType = (data: ArtistTypeType | NewArtistTypeType): void => {
    if ('id' in data) {
      // It's an update
      const { id, ...updateData } = data;
      const { createdAt, updatedAt, deletedAt, ...cleanedData } = updateData as any;
      
      updateMutation.mutate(
        { id, data: cleanedData },
        {
          onSuccess: () => {
            setArtistTypes(prev => 
              prev.map(at => at.id === id ? data as ArtistTypeType : at)
            );
          }
        }
      );
    } else {
      // It's a creation
      createMutation.mutate(data as NewArtistTypeType, {
        onSuccess: (newArtistType) => {
          setArtistTypes(prev => [...prev, newArtistType as ArtistTypeType]);
        }
      });
    }
  };

  // Function to delete an artist type
  const deleteArtistType = async (artistType: ArtistTypeType) => {
    // Optimistic UI update
    setArtistTypes(prev => prev.filter(at => at.id !== artistType.id));
    
    // Call the delete mutation
    deleteMutation.mutate(artistType.id);
    
    return true;
  };

  // Function to handle creating a new artist type
  const createArtistType = () => {
    // Generate a new artist type
    const newData = generateNewArtistType();
    const newTitle = "New " + newData.title;
    
    // Create new artist type with modified title
    const newArtistTypeData: NewArtistTypeType = {
      ...newData,
      title: newTitle
    };
    
    // Create the artist type
    createMutation.mutate(newArtistTypeData, {
      onSuccess: (data) => {
        // Add to our local state
        setArtistTypes(prev => [...prev, data as ArtistTypeType]);
      }
    });
  };

  // Define the runtime props for this instance of the table
  const runtimeProps: ArtistTypeTableRuntimeProps = {
    data: artistTypes,
    onEdit: saveArtistType,
    onDelete: deleteArtistType,
    onCreateNew: createArtistType,
    onFieldUpdate: handleFieldUpdate,
    editable: true,
  };

  // Merge the base props with runtime props
  const tableProps: DataTableProps<ArtistTypeType> = {
    ...artistTypeTableBaseProps,
    ...runtimeProps,
    columns: artistTypeTableConfig.columns, // Ensure columns are explicitly set
  };

  // Configure columns and render the data table
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Artist Type Management</h1>
        <p className="mb-6 text-gray-600">
          This demo page demonstrates CRUD operations for Artist Types. You can create, read, update, and delete artist types.
        </p>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <DataTable {...tableProps} />
        )}
      </div>
    </QueryClientProvider>
  );
} 