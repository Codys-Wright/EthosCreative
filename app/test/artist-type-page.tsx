"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal } from "lucide-react";

// Import the hooks
import { ArtistTypeHooks } from "@/features/artist-types/api/artist-type.hooks";

// Import the correct types and schemas
import {
  ArtistType,
  NewArtistType,
  ArtistTypeType,
  NewArtistTypeType,
  ArtistTypeGroups,
} from "@/features/artist-types/types/artist-type.type";

// Import our components
import { SchemaFormRenderer } from "./components/SchemaFormRenderer";
import { SchemaDataTable } from "./components/SchemaDataTable";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Main Page Component
export default function ArtistTypePage() {
  // Fetch data using hooks
  const { data: artistTypes, isLoading, error } = ArtistTypeHooks.useGetAll();
  const createMutation = ArtistTypeHooks.useCreate();
  const updateMutation = ArtistTypeHooks.useUpdate();
  const deleteMutation = ArtistTypeHooks.useDelete();

  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<{ id: string } | null>(null);

  // Form submission handlers now use mutations
  const handleCreateSubmit = (data: Record<string, any>) => {
    // Ensure order is a number
    if (data.order && typeof data.order === "string") {
      data.order = Number(data.order);
    }

    if (createMutation.mutate) {
      createMutation.mutate(data as NewArtistTypeType);
      setIsCreateDialogOpen(false);
    }
  };

  const handleEditSubmit = (data: Record<string, any>) => {
    // Ensure order is a number
    if (data.order && typeof data.order === "string") {
      data.order = Number(data.order);
    }

    if (currentItem && updateMutation.mutate) {
      updateMutation.mutate({
        id: currentItem.id,
        data: data as Partial<NewArtistTypeType>,
      });
      setIsEditDialogOpen(false);
      setCurrentItem(null);
    }
  };

  const handleDelete = () => {
    if (currentItem?.id) {
      deleteMutation.mutate(currentItem.id);
      setIsDeleteDialogOpen(false);
      setCurrentItem(null);
    }
  };

  const startEditing = (item: { id: string }) => {
    setCurrentItem(item);
    setIsEditDialogOpen(true);
  };

  const startDeleting = (item: { id: string }) => {
    setCurrentItem(item);
    setIsDeleteDialogOpen(true);
  };

  const startCreating = () => {
    setIsCreateDialogOpen(true);
  };

  // Select fields to display in the table
  const displayFields = ["order", "title", "subtitle"];

  // Custom action handler for the data table
  const handleAction = (action: string, item: { id: string }) => {
    switch (action) {
      case "edit":
        startEditing(item);
        break;
      case "delete":
        startDeleting(item);
        break;
      default:
        console.warn(`Unknown action: ${action}`);
    }
  };

  // Custom row actions renderer
  const renderRowActions = (item: { id: string }) => {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => startEditing(item)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => startDeleting(item)}
            className="text-red-600"
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Artist Types</h1>

      {/* Loading and error states */}
      {isLoading && (
        <div className="flex justify-center my-8">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
          <p>Failed to load artist types: {error.message}</p>
        </div>
      )}

      {/* Data Table */}
      {!isLoading && !error && artistTypes && artistTypes.length > 0 && (
        <SchemaDataTable
          data={artistTypes}
          schema={{ groups: ArtistTypeGroups }}
          title="Artist Types"
          description="A list of all artist types in the system. Use the Order field to control the display sequence (lower numbers appear first)."
          displayFields={displayFields}
          onCreateNew={startCreating}
          searchPlaceholder="Search artist types..."
          pageSize={5}
          renderRowActions={renderRowActions}
        />
      )}

      {/* Show message when no data exists */}
      {!isLoading && !error && (!artistTypes || artistTypes.length === 0) && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded my-4">
          <p>No artist types found. Create your first one!</p>
          <Button className="mt-2" onClick={startCreating}>
            Create Artist Type
          </Button>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Artist Type</DialogTitle>
            <DialogDescription>
              Fill out the form to create a new artist type.
            </DialogDescription>
          </DialogHeader>
          <SchemaFormRenderer
            schema={NewArtistType}
            schemaName="NewArtistType"
            onSubmit={handleCreateSubmit}
            mode="create"
            title=""
            description=""
          />
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="schema-form"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" /> Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Artist Type</DialogTitle>
            <DialogDescription>
              Update the artist type details.
            </DialogDescription>
          </DialogHeader>
          {currentItem && (
            <>
              <ArtistTypeEditor
                id={currentItem.id}
                onSubmit={handleEditSubmit}
              />
              <DialogFooter className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setCurrentItem(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  form="schema-form"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" /> Updating...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              artist type.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setCurrentItem(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleteMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Editor component that fetches and displays an artist type for editing
function ArtistTypeEditor({
  id,
  onSubmit,
}: {
  id: string;
  onSubmit: (data: Record<string, any>) => void;
}) {
  const {
    data: artistTypeData,
    isLoading,
    error,
  } = ArtistTypeHooks.useGetById(id);

  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
        <p>Failed to load artist type: {error.message}</p>
      </div>
    );
  }

  if (!artistTypeData) {
    return <div>No data found</div>;
  }

  // Create a local variable that we know is the actual artist type data
  const artistType = artistTypeData as ArtistTypeType;

  return (
    <SchemaFormRenderer
      schema={ArtistType}
      schemaName="ArtistType"
      initialData={artistType}
      onSubmit={onSubmit}
      mode="edit"
      title=""
      description=""
    />
  );
}
