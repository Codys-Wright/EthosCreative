"use client";

import { useState } from "react";
import {
  useGetAll,
  useGetById,
  useCreate,
  useUpdate,
  useDelete,
} from "../../service/example.hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import type { Example } from "../../service/types/example.type";

export const ExampleComponent = () => {
  const [content, setContent] = useState("");
  const [exampleId, setExampleId] = useState("");

  // Get all examples
  const {
    data: examples = [],
    isLoading: isLoadingExamples,
    refetch: refetchExamples,
  } = useGetAll();

  // Get example by ID
  const {
    data: singleExample,
    isLoading: isLoadingSingle,
    refetch: refetchSingle,
  } = useGetById(exampleId);

  // Create a new example
  const createMutation = useCreate();

  // Update an example
  const updateMutation = useUpdate();

  // Delete an example
  const deleteMutation = useDelete();

  const handleCreate = () => {
    if (!content) {
      toast.error("Please enter content");
      return;
    }

    createMutation.mutate(
      { content },
      {
        onSuccess: () => {
          toast.success("Example created successfully");
          setContent("");
          refetchExamples();
        },
        onError: (error) => {
          toast.error(`Error creating example: ${error.message}`);
        },
      },
    );
  };

  const handleUpdate = () => {
    if (!exampleId || !content) {
      toast.error("Please enter both ID and content");
      return;
    }

    updateMutation.mutate(
      {
        id: exampleId,
        data: { content },
      },
      {
        onSuccess: () => {
          toast.success("Example updated successfully");
          refetchExamples();
          refetchSingle();
        },
        onError: (error) => {
          toast.error(`Error updating example: ${error.message}`);
        },
      },
    );
  };

  const handleDelete = () => {
    if (!exampleId) {
      toast.error("Please enter an ID");
      return;
    }

    deleteMutation.mutate(exampleId, {
      onSuccess: () => {
        toast.success("Example deleted successfully");
        setExampleId("");
        refetchExamples();
      },
      onError: (error) => {
        toast.error(`Error deleting example: ${error.message}`);
      },
    });
  };

  const handleFetchById = () => {
    if (!exampleId) {
      toast.error("Please enter an ID");
      return;
    }
    refetchSingle();
  };

  // Helper function to safely format dates
  const formatDate = (dateValue: any) => {
    if (!dateValue) return "N/A";
    try {
      return new Date(dateValue).toLocaleString();
    } catch (error) {
      return "Invalid date";
    }
  };

  // Type guard to check if an object is an Example
  const isExample = (obj: any): obj is Example => {
    return obj && typeof obj === "object" && "id" in obj && "content" in obj;
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Example</CardTitle>
          <CardDescription>Add a new example to the database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Enter content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Example</CardTitle>
          <CardDescription>
            Update or delete an existing example
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Enter example ID"
              value={exampleId}
              onChange={(e) => setExampleId(e.target.value)}
            />
            <Button onClick={handleFetchById} disabled={isLoadingSingle}>
              {isLoadingSingle ? "Loading..." : "Fetch"}
            </Button>
          </div>

          {singleExample && isExample(singleExample) && (
            <div className="p-4 border rounded-md bg-muted">
              <p>
                <strong>ID:</strong> {singleExample.id}
              </p>
              <p>
                <strong>Content:</strong> {singleExample.content}
              </p>
              <p>
                <strong>Created:</strong> {formatDate(singleExample.createdAt)}
              </p>
              <p>
                <strong>Updated:</strong> {formatDate(singleExample.updatedAt)}
              </p>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Input
              placeholder="New content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update"}
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              variant="destructive"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Examples</CardTitle>
          <CardDescription>
            List of all examples in the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingExamples ? (
            <p>Loading examples...</p>
          ) : examples.length > 0 ? (
            <div className="space-y-2">
              {examples.map(
                (example: any) =>
                  isExample(example) && (
                    <div
                      key={example.id}
                      className="p-3 border rounded-md hover:bg-muted cursor-pointer"
                      onClick={() => {
                        setExampleId(example.id);
                        setContent(example.content);
                      }}
                    >
                      <p>
                        <strong>ID:</strong> {example.id}
                      </p>
                      <p>
                        <strong>Content:</strong> {example.content}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Created: {formatDate(example.createdAt)}
                      </p>
                    </div>
                  ),
              )}
            </div>
          ) : (
            <p>No examples found</p>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => refetchExamples()}>Refresh List</Button>
        </CardFooter>
      </Card>
    </div>
  );
};
