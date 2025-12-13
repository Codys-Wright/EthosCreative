import { Banner, Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,  DialogTitle, cn } from "@shadcn";
import {
  deleteFilesAtom,
  filesAtom,
  selectedFilesAtom,
} from "../../-files/files-atoms";
import { Result, useAtom, useAtomValue } from "@effect-atom/atom-react";
import { FolderId, UploadedFileId } from "../../../domain/files-rpc";
import * as Arr from "effect/Array";
import * as Cause from "effect/Cause";
import * as Option from "effect/Option";
import { AlertTriangleIcon, FileIcon, FolderIcon } from "lucide-react";
import React from "react";

type DeleteConfirmationDialogProps = {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
};

type DisplayItem = {
  readonly id: UploadedFileId | FolderId;
  readonly name: string;
  readonly type: "file" | "folder";
  readonly indented: boolean;
};

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const selection = useAtomValue(selectedFilesAtom);
  const filesResult = useAtomValue(filesAtom);
  const [deleteResult, deleteFiles] = useAtom(deleteFilesAtom, { mode: "promiseExit" });

  const displayItems = React.useMemo(
    () =>
      filesResult.pipe(
        Result.map(({ rootFiles, folders }) => {
          const selectedRootFiles = Arr.filter(rootFiles, (file) =>
            Arr.contains(selection.fileIds, file.id),
          );

          const selectedFolders = Arr.filter(folders, (folder) =>
            Arr.contains(selection.folderIds, folder.id),
          );

          const selectedFilesInFolders = Arr.flatMap(folders, (folder) =>
            Arr.filterMap(folder.files, (file) =>
              Arr.contains(selection.fileIds, file.id) &&
              !Arr.contains(selection.folderIds, folder.id)
                ? Option.some({
                    id: file.id,
                    name: file.name,
                    type: "file" as const,
                    indented: false,
                  })
                : Option.none(),
            ),
          );

          return Arr.appendAll(
            Arr.appendAll(
              Arr.map(
                selectedRootFiles,
                (file): DisplayItem => ({
                  id: file.id,
                  name: file.name,
                  type: "file",
                  indented: false,
                }),
              ),
              selectedFilesInFolders,
            ),
            Arr.flatMap(selectedFolders, (folder): readonly DisplayItem[] =>
              Arr.prepend(
                Arr.map(
                  folder.files,
                  (file): DisplayItem => ({
                    id: file.id,
                    name: file.name,
                    type: "file",
                    indented: true,
                  }),
                ),
                {
                  id: folder.id,
                  name: folder.name,
                  type: "folder",
                  indented: false,
                },
              ),
            ),
          );
        }),
        Result.getOrElse(() => Arr.empty<DisplayItem>()),
      ),
    [selection, filesResult],
  );

  const totalSelectedCount = selection.fileIds.length + selection.folderIds.length;

  const handleDelete = () => {
    deleteFiles().then((result) => {
      if (result._tag === "Success") {
        onOpenChange(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="destructive">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-destructive/10 p-2 text-destructive">
              <AlertTriangleIcon className="size-5" />
            </div>
            <DialogTitle>
              Delete {totalSelectedCount} item{totalSelectedCount === 1 ? "" : "s"}?
            </DialogTitle>
          </div>
          <DialogDescription>
            This action cannot be undone. The following items will be permanently deleted:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {deleteResult.waiting && (
            <Banner variant="loading">
              <Banner.Content>
                <Banner.Title>Deleting files...</Banner.Title>
              </Banner.Content>
            </Banner>
          )}

          {!deleteResult.waiting && Result.isFailure(deleteResult) && (
            <Banner variant="destructive">
              <Banner.Content>
                <Banner.Title>Failed to delete files</Banner.Title>
                <Banner.Description className="line-clamp-2 whitespace-pre-wrap">
                  {Cause.pretty(deleteResult.cause)}
                </Banner.Description>
              </Banner.Content>
            </Banner>
          )}

          <div className="max-h-60 overflow-y-auto rounded-md border border-destructive/20 bg-destructive/5 p-4">
            <ul className="space-y-2">
              {displayItems.map((item) => (
                <li
                  key={item.id}
                  className={cn("flex items-center gap-2 text-sm", item.indented && "ml-6")}
                >
                  {item.type === "folder" ? (
                    <FolderIcon className="size-4 shrink-0" />
                  ) : (
                    <FileIcon className="size-4 shrink-0" />
                  )}
                  <span className="truncate">{item.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteResult.waiting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteResult.waiting}
          >
            {deleteResult.waiting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
