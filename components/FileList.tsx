"use client";

import type { QueuedFile } from "../lib/types";
import { formatFileSize } from "../lib/format-output";

const TYPE_COLORS: Record<string, string> = {
  pdf: "bg-red-100 text-red-700",
  docx: "bg-blue-100 text-blue-700",
  txt: "bg-gray-100 text-gray-700",
  html: "bg-orange-100 text-orange-700",
};

interface Props {
  files: QueuedFile[];
  onRemove: (id: string) => void;
  processing: boolean;
}

export default function FileList({ files, onRemove, processing }: Props) {
  if (files.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-warm-dim">
          {files.length} file{files.length !== 1 ? "s" : ""} queued
        </p>
      </div>
      <div className="space-y-1.5">
        {files.map((f) => (
          <div
            key={f.id}
            className="flex items-center gap-3 rounded-lg border border-warm-border bg-warm-white px-4 py-2.5"
          >
            <span
              className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${TYPE_COLORS[f.type] || "bg-gray-100 text-gray-700"}`}
            >
              {f.type}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-warm-body">{f.relativePath}</p>
            </div>
            <span className="flex-shrink-0 text-xs text-warm-dim">
              {formatFileSize(f.size)}
            </span>
            {f.status === "error" && (
              <span className="flex-shrink-0 text-xs text-warm-red" title={f.error}>
                Failed
              </span>
            )}
            {f.status === "complete" && (
              <span className="flex-shrink-0 text-xs text-warm-green">Done</span>
            )}
            {!processing && f.status === "queued" && (
              <button
                type="button"
                onClick={() => onRemove(f.id)}
                className="flex-shrink-0 text-warm-dim hover:text-warm-red transition-colors"
                aria-label={`Remove ${f.name}`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
