"use client";

import { useCallback, useRef, useState } from "react";
import type { FileType } from "../lib/types";

const SUPPORTED_EXTENSIONS = new Set(["pdf", "docx", "txt", "html", "htm"]);

function getFileType(name: string): FileType | null {
  const ext = name.split(".").pop()?.toLowerCase();
  if (!ext || !SUPPORTED_EXTENSIONS.has(ext)) return null;
  if (ext === "htm") return "html";
  return ext as FileType;
}

interface FileWithPath {
  file: File;
  relativePath: string;
}

async function getEntriesFromDrop(
  dataTransfer: DataTransfer
): Promise<FileWithPath[]> {
  const results: FileWithPath[] = [];

  async function readEntry(
    entry: FileSystemEntry,
    path: string
  ): Promise<void> {
    if (entry.isFile) {
      const fileEntry = entry as FileSystemFileEntry;
      const file = await new Promise<File>((resolve) =>
        fileEntry.file(resolve)
      );
      if (getFileType(file.name)) {
        results.push({ file, relativePath: path + file.name });
      }
    } else if (entry.isDirectory) {
      const dirEntry = entry as FileSystemDirectoryEntry;
      const reader = dirEntry.createReader();
      const entries = await new Promise<FileSystemEntry[]>((resolve) =>
        reader.readEntries(resolve)
      );
      for (const child of entries) {
        await readEntry(child, path + entry.name + "/");
      }
    }
  }

  const items = dataTransfer.items;
  for (let i = 0; i < items.length; i++) {
    const entry = items[i].webkitGetAsEntry?.();
    if (entry) {
      await readEntry(entry, "");
    }
  }

  // Fallback if webkitGetAsEntry not supported
  if (results.length === 0 && dataTransfer.files.length > 0) {
    for (let i = 0; i < dataTransfer.files.length; i++) {
      const file = dataTransfer.files[i];
      if (getFileType(file.name)) {
        results.push({ file, relativePath: file.name });
      }
    }
  }

  return results;
}

interface Props {
  onFilesAdded: (files: FileWithPath[]) => void;
  disabled?: boolean;
}

export type { FileWithPath };

export default function FileDropZone({ onFilesAdded, disabled }: Props) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (disabled) return;
      const files = await getEntriesFromDrop(e.dataTransfer);
      if (files.length > 0) onFilesAdded(files);
    },
    [onFilesAdded, disabled]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputFiles = e.target.files;
      if (!inputFiles) return;
      const results: FileWithPath[] = [];
      for (let i = 0; i < inputFiles.length; i++) {
        const file = inputFiles[i];
        if (getFileType(file.name)) {
          const path =
            (file as File & { webkitRelativePath?: string })
              .webkitRelativePath || file.name;
          results.push({ file, relativePath: path });
        }
      }
      if (results.length > 0) onFilesAdded(results);
      e.target.value = "";
    },
    [onFilesAdded]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`rounded-lg border-2 border-dashed p-10 text-center transition-colors ${
        dragOver
          ? "border-warm-accent bg-warm-subtle"
          : "border-warm-border hover:border-warm-border-hover"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <svg
        className="mx-auto h-10 w-10 text-warm-dim"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
        />
      </svg>
      <p className="mt-3 text-sm font-medium text-warm-body">
        Drop files or a folder here
      </p>
      <p className="mt-1 text-xs text-warm-dim">
        Supports PDF, DOCX, TXT, HTML
      </p>
      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="rounded-md bg-warm-accent px-4 py-2 text-sm font-medium text-white hover:bg-warm-accent-light disabled:opacity-50 transition-colors"
        >
          Browse Files
        </button>
        <button
          type="button"
          onClick={() => folderInputRef.current?.click()}
          disabled={disabled}
          className="rounded-md border border-warm-border px-4 py-2 text-sm font-medium text-warm-body hover:bg-warm-white hover:border-warm-border-hover disabled:opacity-50 transition-colors"
        >
          Browse Folder
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.txt,.html,.htm"
        onChange={handleFileInput}
        className="hidden"
      />
      <input
        ref={folderInputRef}
        type="file"
        // @ts-expect-error webkitdirectory is non-standard
        webkitdirectory=""
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
}
