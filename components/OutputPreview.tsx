"use client";

import { useState } from "react";
import type { ExtractionResult } from "../lib/types";
import {
  formatCombined,
  estimateTokens,
  splitIntoChunks,
} from "../lib/format-output";
import {
  downloadIndividualZip,
  downloadCombinedChunks,
} from "../lib/zip-output";

const METHOD_LABELS: Record<string, string> = {
  native: "Native",
  ocr: "OCR",
  mixed: "Mixed",
};

const METHOD_COLORS: Record<string, string> = {
  native: "bg-warm-green-bg text-warm-green",
  ocr: "bg-warm-yellow-bg text-warm-yellow",
  mixed: "bg-blue-50 text-blue-700",
};

interface Props {
  results: ExtractionResult[];
}

export default function OutputPreview({ results }: Props) {
  const [copied, setCopied] = useState(false);

  if (results.length === 0) return null;

  const totalChars = results.reduce((s, r) => s + r.totalCharacters, 0);
  const totalPages = results.reduce((s, r) => s + r.totalPages, 0);
  const tokens = estimateTokens(totalChars);
  const chunks = splitIntoChunks(results);

  async function copyAll() {
    const text = formatCombined(results);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may fail
    }
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex flex-col gap-3 rounded-lg bg-[rgba(30,58,95,0.06)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-warm-accent">
            {results.length} file{results.length !== 1 ? "s" : ""} extracted
          </p>
          <p className="text-xs text-warm-muted mt-0.5">
            {totalPages} pages &middot; {totalChars.toLocaleString()} characters &middot; ~{tokens.toLocaleString()} tokens
            {chunks.length > 1 && ` &middot; ${chunks.length} chunks`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyAll}
            className="rounded-md border border-warm-border bg-warm-white px-3 py-1.5 text-xs font-medium text-warm-body hover:border-warm-border-hover transition-colors"
          >
            {copied ? "Copied!" : "Copy All"}
          </button>
          <button
            type="button"
            onClick={() => downloadIndividualZip(results)}
            className="rounded-md border border-warm-border bg-warm-white px-3 py-1.5 text-xs font-medium text-warm-body hover:border-warm-border-hover transition-colors"
          >
            Download ZIP
          </button>
          <button
            type="button"
            onClick={() => downloadCombinedChunks(results)}
            className="rounded-md bg-warm-accent px-3 py-1.5 text-xs font-medium text-white hover:bg-warm-accent-light transition-colors"
          >
            Download Combined (~100K tokens/file)
          </button>
        </div>
      </div>

      {/* Per-document collapsibles */}
      <div className="space-y-2">
        {results.map((r) => (
          <details
            key={r.fileId}
            className="rounded-lg border border-warm-border bg-warm-white overflow-hidden"
          >
            <summary className="flex items-center gap-3 cursor-pointer select-none px-4 py-3 text-sm hover:bg-warm-subtle transition-colors">
              <span className="font-medium text-warm-body flex-1 truncate">
                {r.relativePath}
              </span>
              <span
                className={`flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${METHOD_COLORS[r.method]}`}
              >
                {METHOD_LABELS[r.method]}
              </span>
              <span className="flex-shrink-0 text-xs text-warm-dim">
                {r.totalPages} pg &middot; {r.totalCharacters.toLocaleString()} chars
              </span>
            </summary>
            <div className="border-t border-warm-border">
              <pre className="whitespace-pre-wrap break-words bg-warm-subtle p-4 text-xs text-warm-body leading-relaxed max-h-96 overflow-y-auto">
                {r.pages.map((p) => p.text.trim()).join("\n\n---\n\n")}
              </pre>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
