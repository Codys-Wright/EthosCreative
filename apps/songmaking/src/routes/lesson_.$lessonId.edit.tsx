/**
 * Lesson Edit Page
 *
 * Allows editing lesson parts with:
 * - Drag-and-drop reordering of parts
 * - Add/remove lesson parts
 * - Edit part properties (title, type, duration)
 * - Markdown editing for text/assignment parts
 */

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import {
  Badge,
  Button,
  Card,
  Dialog,
  Input,
  Label,
  Select,
  Sidebar,
  SidebarProvider,
  ScrollArea,
} from "@shadcn";
import {
  ArrowLeft,
  Save,
  X,
  ChevronRight,
  PlayCircle,
  FileText,
  HelpCircle,
  ClipboardList,
  FileDown,
  GripVertical,
  Plus,
  Trash2,
  Pencil,
} from "lucide-react";
import { Editor } from "@components/markdown-editor/editor";
import { CourseSidebar } from "../components/course-sidebar.js";
import {
  getLessonById,
  getSectionById,
  getLessonParts,
  SONGMAKING_COURSE,
  SONGMAKING_LESSON_PARTS,
  type LessonPart,
  type LessonId,
} from "../data/course.js";

import { cn } from "@shadcn/lib/utils";

export const Route = createFileRoute("/lesson_/$lessonId/edit")({
  component: LessonEditPageWrapper,
});

// =============================================================================
// Types
// =============================================================================

type PartType = "video" | "text" | "quiz" | "assignment" | "download";

// =============================================================================
// Helper Components
// =============================================================================

function PartTypeIcon({
  type,
  className,
}: {
  type: PartType;
  className?: string;
}) {
  const iconClass = cn("w-4 h-4", className);
  switch (type) {
    case "video":
      return <PlayCircle className={iconClass} />;
    case "text":
      return <FileText className={iconClass} />;
    case "quiz":
      return <HelpCircle className={iconClass} />;
    case "assignment":
      return <ClipboardList className={iconClass} />;
    case "download":
      return <FileDown className={iconClass} />;
  }
}

function PartTypeBadge({ type }: { type: PartType }) {
  const colors: Record<PartType, string> = {
    video: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    text: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    quiz: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    assignment:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    download:
      "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  };

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 px-2 py-0.5 text-xs", colors[type])}
    >
      <PartTypeIcon type={type} className="w-3 h-3" />
      {type}
    </Badge>
  );
}

// =============================================================================
// Sortable Part Item
// =============================================================================

function SortablePartItem({
  part,
  index,
  isActive,
  hasChanges,
  onSelect,
  onEdit,
  onDelete,
}: {
  part: LessonPart;
  index: number;
  isActive: boolean;
  hasChanges: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: part.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  const isEditable = part.type === "text" || part.type === "assignment";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-start gap-2 p-3 rounded-lg text-sm transition-colors group",
        isDragging && "shadow-lg ring-2 ring-primary/20",
        isActive
          ? "bg-primary/10 text-primary border border-primary/20"
          : "hover:bg-muted text-foreground"
      )}
    >
      <button
        className="cursor-grab active:cursor-grabbing touch-none mt-0.5 opacity-50 group-hover:opacity-100"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>

      <button
        onClick={onSelect}
        disabled={!isEditable}
        className={cn(
          "flex-1 flex items-start gap-3 text-left",
          !isEditable && "cursor-default"
        )}
      >
        <div
          className={cn(
            "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
            isActive
              ? "bg-primary text-primary-foreground"
              : "bg-muted-foreground/20 text-muted-foreground"
          )}
        >
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate font-medium">{part.title}</span>
            {hasChanges && (
              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
            )}
          </div>
          <div className="mt-1">
            <PartTypeBadge type={part.type} />
          </div>
        </div>
      </button>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

// =============================================================================
// Part List Sidebar with DnD
// =============================================================================

function PartListSidebar({
  parts,
  currentPartIndex,
  onPartSelect,
  onReorder,
  onAddPart,
  onEditPart,
  onDeletePart,
  changedParts,
}: {
  parts: LessonPart[];
  currentPartIndex: number;
  onPartSelect: (index: number) => void;
  onReorder: (parts: LessonPart[]) => void;
  onAddPart: () => void;
  onEditPart: (part: LessonPart) => void;
  onDeletePart: (part: LessonPart) => void;
  changedParts: Set<string>;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = parts.findIndex((p) => p.id === active.id);
      const newIndex = parts.findIndex((p) => p.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(parts, oldIndex, newIndex).map(
          (part, idx) => ({
            ...part,
            sortOrder: idx,
          })
        );
        onReorder(reordered);
      }
    }
  };

  return (
    <div className="w-72 border-r bg-muted/30 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">Lesson Parts</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {parts.length} parts
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onAddPart}>
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext
              items={parts.map((p) => p.id)}
              strategy={verticalListSortingStrategy}
            >
              {parts.map((part, index) => (
                <SortablePartItem
                  key={part.id}
                  part={part}
                  index={index}
                  isActive={index === currentPartIndex}
                  hasChanges={changedParts.has(part.id)}
                  onSelect={() => onPartSelect(index)}
                  onEdit={() => onEditPart(part)}
                  onDelete={() => onDeletePart(part)}
                />
              ))}
            </SortableContext>
          </DndContext>

          {parts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No parts yet</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={onAddPart}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add First Part
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

// =============================================================================
// Add/Edit Part Dialog
// =============================================================================

function PartDialog({
  open,
  onOpenChange,
  onSave,
  part,
  mode,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { title: string; type: PartType }) => void;
  part?: LessonPart | null;
  mode: "add" | "edit";
}) {
  const [title, setTitle] = useState(part?.title ?? "");
  const [type, setType] = useState<PartType>(part?.type ?? "text");

  // Reset form when dialog opens with different part
  useState(() => {
    if (open) {
      setTitle(part?.title ?? "");
      setType(part?.type ?? "text");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ title: title.trim(), type });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <form onSubmit={handleSubmit}>
          <Dialog.Header>
            <Dialog.Title>
              {mode === "add" ? "Add New Part" : "Edit Part"}
            </Dialog.Title>
            <Dialog.Description>
              {mode === "add"
                ? "Create a new content part for this lesson."
                : "Update the part properties."}
            </Dialog.Description>
          </Dialog.Header>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="part-title">Title</Label>
              <Input
                id="part-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter part title..."
                
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="part-type">Type</Label>
              <Select
                value={type}
                onValueChange={(v) => setType(v as PartType)}
              >
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="text">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Text
                    </div>
                  </Select.Item>
                  <Select.Item value="video">
                    <div className="flex items-center gap-2">
                      <PlayCircle className="w-4 h-4" />
                      Video
                    </div>
                  </Select.Item>
                  <Select.Item value="quiz">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      Quiz
                    </div>
                  </Select.Item>
                  <Select.Item value="assignment">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" />
                      Assignment
                    </div>
                  </Select.Item>
                  <Select.Item value="download">
                    <div className="flex items-center gap-2">
                      <FileDown className="w-4 h-4" />
                      Download
                    </div>
                  </Select.Item>
                </Select.Content>
              </Select>
            </div>
          </div>

          <Dialog.Footer>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              {mode === "add" ? "Add Part" : "Save Changes"}
            </Button>
          </Dialog.Footer>
        </form>
      </Dialog.Content>
    </Dialog>
  );
}

// =============================================================================
// Delete Confirmation Dialog
// =============================================================================

function DeletePartDialog({
  open,
  onOpenChange,
  onConfirm,
  partTitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  partTitle: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Delete Part</Dialog.Title>
          <Dialog.Description>
            Are you sure you want to delete "{partTitle}"? This action cannot be
            undone.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}

// =============================================================================
// Main Components
// =============================================================================

function LessonEditPageWrapper() {
  const params = Route.useParams() as { lessonId: string };
  const lessonId = params.lessonId;

  return (
    <SidebarProvider defaultOpen>
      <CourseSidebar currentLessonId={lessonId} />
      <Sidebar.Inset>
        <LessonEditPage lessonId={lessonId} />
      </Sidebar.Inset>
    </SidebarProvider>
  );
}

function LessonEditPage({ lessonId }: { lessonId: string }) {
  const navigate = useNavigate();

  // Cast lessonId to branded type for lookup functions
  const lesson = getLessonById(lessonId as LessonId);
  const section = lesson ? getSectionById(lesson.sectionId) : null;
  const initialParts = lesson ? [...getLessonParts(lesson.id)] : [];

  // Mutable parts state
  const [parts, setParts] = useState<LessonPart[]>(initialParts);

  // Track current part being edited
  const [currentPartIndex, setCurrentPartIndex] = useState(0);

  // Track changes per part (partId -> markdown content)
  const changesRef = useRef<Map<string, string>>(new Map());
  const [changedParts, setChangedParts] = useState<Set<string>>(new Set());

  // Track structural changes (reorder, add, delete)
  const [hasStructuralChanges, setHasStructuralChanges] = useState(false);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partToEdit, setPartToEdit] = useState<LessonPart | null>(null);
  const [partToDelete, setPartToDelete] = useState<LessonPart | null>(null);

  const currentPart = parts[currentPartIndex];
  const isEditable =
    currentPart?.type === "text" || currentPart?.type === "assignment";

  // Get initial content for current part
  const getInitialMarkdown = (part: LessonPart | undefined) => {
    if (!part) return "";
    const saved = changesRef.current.get(part.id);
    if (saved !== undefined) return saved;
    return part.mdxContent ?? "";
  };

  // Handlers
  const handleReorder = useCallback((reorderedParts: LessonPart[]) => {
    setParts(reorderedParts);
    setHasStructuralChanges(true);
  }, []);

  const handleAddPart = useCallback(
    (data: { title: string; type: PartType }) => {
      const newPart: LessonPart = {
        id: `new-${Date.now()}` as any,
        lessonId: lessonId as any,
        title: data.title,
        type: data.type,
        sortOrder: parts.length,
        durationMinutes: 0,
        mdxContent:
          data.type === "text" || data.type === "assignment" ? "" : null,
        videoContent: null,
        quizId: null,
        quizPassingScore: null,
        quizIsRequired: false,
        downloadFiles: null,
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      };
      setParts((prev) => [...prev, newPart]);
      setHasStructuralChanges(true);
      // Select the new part
      setCurrentPartIndex(parts.length);
    },
    [lessonId, parts.length]
  );

  const handleEditPart = useCallback(
    (data: { title: string; type: PartType }) => {
      if (!partToEdit) return;
      setParts((prev) =>
        prev.map((p) =>
          p.id === partToEdit.id
            ? {
                ...p,
                title: data.title,
                type: data.type,
              }
            : p
        )
      );
      setHasStructuralChanges(true);
      setPartToEdit(null);
    },
    [partToEdit]
  );

  const handleDeletePart = useCallback(() => {
    if (!partToDelete) return;
    const deleteIndex = parts.findIndex((p) => p.id === partToDelete.id);
    setParts((prev) => prev.filter((p) => p.id !== partToDelete.id));
    setHasStructuralChanges(true);
    // Adjust current index if needed
    if (currentPartIndex >= deleteIndex && currentPartIndex > 0) {
      setCurrentPartIndex((prev) => prev - 1);
    }
    setDeleteDialogOpen(false);
    setPartToDelete(null);
  }, [partToDelete, parts, currentPartIndex]);

  const handlePartChange = useCallback(
    (markdown: string) => {
      if (!currentPart) return;
      changesRef.current.set(currentPart.id, markdown);
      setChangedParts((prev) => {
        const next = new Set(prev);
        next.add(currentPart.id);
        return next;
      });
    },
    [currentPart]
  );

  const handlePartSelect = useCallback(
    (index: number) => {
      const part = parts[index];
      if (part && (part.type === "text" || part.type === "assignment")) {
        setCurrentPartIndex(index);
      }
    },
    [parts]
  );

  const handleSave = () => {
    const contentChanges = Array.from(changesRef.current.entries());
    const updatedParts = parts.map((part) => {
      const contentChange = changesRef.current.get(part.id);
      if (contentChange !== undefined) {
        return { ...part, mdxContent: contentChange };
      }
      return part;
    });

    console.log("Saving lesson structure:", {
      lessonId,
      parts: updatedParts,
      hasStructuralChanges,
      contentChanges: contentChanges.length,
    });

    // In production: await saveLessonParts(lessonId, updatedParts);

    setChangedParts(new Set());
    changesRef.current.clear();
    setHasStructuralChanges(false);

    navigate({
      to: "/$courseSlug/lesson/$lessonId",
      params: { courseSlug: "songmaking", lessonId },
    });
  };

  const handleCancel = () => {
    const totalChanges = changedParts.size + (hasStructuralChanges ? 1 : 0);
    if (totalChanges > 0) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to cancel?"
      );
      if (!confirmed) return;
    }
    navigate({
      to: "/$courseSlug/lesson/$lessonId",
      params: { courseSlug: "songmaking", lessonId },
    });
  };

  if (!lesson || !section) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-xl font-bold mb-2">Lesson Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The lesson you're trying to edit doesn't exist.
          </p>
          <Link to="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const totalChanges = changedParts.size + (hasStructuralChanges ? 1 : 0);
  const firstEditableIndex = parts.findIndex(
    (p) => p.type === "text" || p.type === "assignment"
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Sticky Header */}
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Link to="/" className="hover:text-foreground transition-colors">
              {SONGMAKING_COURSE.title}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="truncate">{section.title}</span>
            <ChevronRight className="w-4 h-4" />
            <Link
              to="/$courseSlug/lesson/$lessonId"
              params={{ courseSlug: "songmaking", lessonId }}
              className="hover:text-foreground transition-colors"
            >
              {lesson.title}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground font-medium">Edit</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-lg font-semibold">
                {currentPart ? currentPart.title : lesson.title}
              </h1>
              {currentPart && <PartTypeBadge type={currentPart.type} />}
              {totalChanges > 0 && (
                <Badge variant="secondary" className="gap-1.5">
                  {totalChanges} unsaved change
                  {totalChanges > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={totalChanges === 0}
              >
                <Save className="w-4 h-4 mr-2" />
                Save All Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with Part Sidebar */}
      <div className="flex-1 min-h-0 flex">
        {/* Part List Sidebar */}
        <PartListSidebar
          parts={parts}
          currentPartIndex={currentPartIndex}
          onPartSelect={handlePartSelect}
          onReorder={handleReorder}
          onAddPart={() => setAddDialogOpen(true)}
          onEditPart={(part) => {
            setPartToEdit(part);
            setEditDialogOpen(true);
          }}
          onDeletePart={(part) => {
            setPartToDelete(part);
            setDeleteDialogOpen(true);
          }}
          changedParts={changedParts}
        />

        {/* Editor Area */}
        <div className="flex-1 min-h-0">
          {currentPart && isEditable ? (
            <Editor
              key={currentPart.id}
              initialMarkdown={getInitialMarkdown(currentPart)}
              onMarkdownChange={handlePartChange}
            />
          ) : currentPart ? (
            <div className="flex items-center justify-center h-full">
              <Card className="p-8 text-center max-w-md">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <PartTypeIcon
                    type={currentPart.type}
                    className="w-8 h-8 text-muted-foreground"
                  />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {currentPart.title}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {currentPart.type === "video" &&
                    "Video content is edited through the video upload interface."}
                  {currentPart.type === "quiz" &&
                    "Quiz content is edited through the quiz builder."}
                  {currentPart.type === "download" &&
                    "Download resources are managed in the file manager."}
                </p>
                {firstEditableIndex >= 0 && (
                  <Button
                    variant="outline"
                    onClick={() => handlePartSelect(firstEditableIndex)}
                  >
                    Edit Text Content
                  </Button>
                )}
              </Card>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Card className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No parts in this lesson yet.
                </p>
                <Button onClick={() => setAddDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Part
                </Button>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <PartDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSave={handleAddPart}
        mode="add"
      />

      <PartDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={handleEditPart}
        part={partToEdit}
        mode="edit"
      />

      <DeletePartDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeletePart}
        partTitle={partToDelete?.title ?? ""}
      />
    </div>
  );
}
