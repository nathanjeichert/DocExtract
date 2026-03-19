"use client";

import type { QueuedFile } from "../lib/types";

interface Props {
  files: QueuedFile[];
}

export default function ProcessingStatus({ files }: Props) {
  const processing = files.filter((f) => f.status === "processing");
  const complete = files.filter((f) => f.status === "complete");
  const total = files.length;

  if (total === 0) return null;

  const overallProgress =
    total > 0
      ? Math.round(
          files.reduce((sum, f) => sum + (f.status === "complete" ? 100 : f.progress), 0) / total
        )
      : 0;

  return (
    <div className="space-y-3">
      {/* Overall progress */}
      <div>
        <div className="flex items-center justify-between text-xs text-warm-muted mb-1.5">
          <span>
            {complete.length}/{total} files processed
          </span>
          <span>{overallProgress}%</span>
        </div>
        <div className="h-2 rounded-full bg-warm-subtle overflow-hidden">
          <div
            className="h-full bg-warm-accent rounded-full transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Current file status */}
      {processing.map((f) => (
        <div key={f.id} className="text-xs text-warm-muted">
          <div className="flex items-center justify-between mb-1">
            <span className="truncate">{f.name}</span>
            <span>{f.progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-warm-subtle overflow-hidden">
            <div
              className="h-full bg-warm-accent-light rounded-full transition-all duration-300"
              style={{ width: `${f.progress}%` }}
            />
          </div>
          {f.statusText && (
            <p className="mt-0.5 text-warm-dim">{f.statusText}</p>
          )}
        </div>
      ))}
    </div>
  );
}
