"use client";

import { useEffect, useRef } from "react";
import {
  $convertFromMarkdownString,
  ELEMENT_TRANSFORMERS,
  MULTILINE_ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
  CHECK_LIST,
} from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $getRoot,
  $getSelection,
  $setSelection,
  CLEAR_HISTORY_COMMAND,
} from "lexical";

import { EMOJI } from "@components/markdown-editor/transformers/markdown-emoji-transformer";
import { HR } from "@components/markdown-editor/transformers/markdown-hr-transformer";
import { IMAGE } from "@components/markdown-editor/transformers/markdown-image-transformer";
import { TABLE } from "@components/markdown-editor/transformers/markdown-table-transformer";
import { TWEET } from "@components/markdown-editor/transformers/markdown-tweet-transformer";

const TRANSFORMERS = [
  TABLE,
  HR,
  IMAGE,
  EMOJI,
  TWEET,
  CHECK_LIST,
  ...ELEMENT_TRANSFORMERS,
  ...MULTILINE_ELEMENT_TRANSFORMERS,
  ...TEXT_FORMAT_TRANSFORMERS,
  ...TEXT_MATCH_TRANSFORMERS,
];

export function InitialMarkdownPlugin({
  markdown,
}: {
  markdown?: string;
}): null {
  const [editor] = useLexicalComposerContext();
  const hasInitialized = useRef(false);

  // Use useEffect (not useLayoutEffect) to avoid race conditions with AutoFocusPlugin
  useEffect(() => {
    // Only run once on mount
    if (hasInitialized.current) {
      return;
    }
    hasInitialized.current = true;

    // If no markdown, just clear selection to avoid cursor issues
    if (!markdown) {
      editor.update(() => {
        $setSelection(null);
      });
      return;
    }

    // Use a microtask to ensure this runs after AutoFocusPlugin
    queueMicrotask(() => {
      editor.update(
        () => {
          // Clear existing content first
          const root = $getRoot();
          root.clear();

          // Convert markdown to rich content
          $convertFromMarkdownString(markdown, TRANSFORMERS, undefined, true);

          // Clear selection to prevent cursor position issues
          $setSelection(null);
        },
        {
          discrete: true,
          tag: "history-merge", // Prevent this from being undoable
        }
      );

      // Clear history so user can't undo back to raw markdown
      editor.dispatchCommand(CLEAR_HISTORY_COMMAND, undefined);
    });
  }, [editor, markdown]);

  return null;
}
