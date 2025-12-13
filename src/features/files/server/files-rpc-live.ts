import { CurrentUser } from "@/features/auth";
import { FilesRpc } from "../domain/files-rpc.js";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Stream from "effect/Stream";
import { FilesRepo } from "./files-repo.js";
import { UploadThingApi } from "./upload-thing-api.js";

export const FilesRpcLive = FilesRpc.toLayer(
  Effect.gen(function* () {
    const repo = yield* FilesRepo;
    const uploadThingApi = yield* UploadThingApi;

    return FilesRpc.of({
      files_initiateUpload: (payload) =>
        uploadThingApi
          .initiateUpload(payload)
          .pipe(
            Effect.map(({ key, url, fields }) => ({ presignedUrl: url, fileKey: key, fields })),
          ),

      files_createFolder: Effect.fn(function* (payload) {
        const currentUser = yield* CurrentUser;
        return yield* repo.insertFolder({
          userId: currentUser.userId,
          name: payload.folderName,
        });
      }),

      files_deleteFiles: Effect.fn(function* (payload) {
        const currentUser = yield* CurrentUser;
        const uploadthingKeys = yield* repo.deleteFiles({
          fileIds: payload.fileIds,
          userId: currentUser.userId,
        });
        if (uploadthingKeys.length > 0) {
          yield* uploadThingApi.deleteFiles(uploadthingKeys);
        }
      }),

      files_deleteFolders: Effect.fn(function* (payload) {
        const currentUser = yield* CurrentUser;
        const uploadthingKeys = yield* repo.deleteFolders({
          folderIds: payload.folderIds,
          userId: currentUser.userId,
        });
        if (uploadthingKeys.length > 0) {
          yield* uploadThingApi.deleteFiles(uploadthingKeys);
        }
      }),

      files_moveFiles: Effect.fn(function* (payload) {
        const currentUser = yield* CurrentUser;
        yield* repo.moveFiles({
          fileIds: payload.fileIds,
          folderId: payload.folderId,
          userId: currentUser.userId,
        });
      }),

      files_getFilesByKeys: Effect.fn(function* (payload) {
        const currentUser = yield* CurrentUser;
        return yield* repo.getFilesByKeys({
          uploadthingKeys: payload.uploadthingKeys,
          userId: currentUser.userId,
        });
      }),

      files_list: Effect.fnUntraced(function* () {
        const currentUser = yield* CurrentUser;
        const limit = 100;
        return Stream.paginateEffect(0, (offset) =>
          repo
            .listPaginated({
              userId: currentUser.userId,
              offset,
              limit,
            })
            .pipe(
              Effect.map(
                (result) =>
                  [
                    { rootFiles: result.rootFiles, folders: result.folders },
                    result.hasNext ? Option.some(offset + limit) : Option.none<number>(),
                  ] as const,
              ),
            ),
        );
      }, Stream.unwrap),
    });
  }),
).pipe(
  Layer.provide([FilesRepo.Default, UploadThingApi.Default]),
);

