"use client";

import { useState, useCallback } from "react";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import PrivacyBanner from "../components/PrivacyBanner";
import FileDropZone, { type FileWithPath } from "../components/FileDropZone";
import FileList from "../components/FileList";
import ProcessingStatus from "../components/ProcessingStatus";
import OutputPreview from "../components/OutputPreview";
import Spinner from "../components/Spinner";
import type { QueuedFile, ExtractionResult, FileType } from "../lib/types";
import { processFiles } from "../lib/pipeline";

const SUPPORTED_EXTENSIONS = new Set(["pdf", "docx", "txt", "html", "htm"]);

function detectFileType(name: string): FileType {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "htm") return "html";
  if (SUPPORTED_EXTENSIONS.has(ext)) return ext as FileType;
  return "txt";
}

export default function Page() {
  const [files, setFiles] = useState<QueuedFile[]>([]);
  const [results, setResults] = useState<ExtractionResult[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleFilesAdded = useCallback((newFiles: FileWithPath[]) => {
    const queued: QueuedFile[] = newFiles.map((f) => ({
      id: crypto.randomUUID(),
      file: f.file,
      name: f.file.name,
      relativePath: f.relativePath,
      size: f.file.size,
      type: detectFileType(f.file.name),
      status: "queued" as const,
      progress: 0,
    }));
    setFiles((prev) => [...prev, ...queued]);
  }, []);

  const handleRemove = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const handleClear = useCallback(() => {
    setFiles([]);
    setResults([]);
  }, []);

  const handleProcessAll = useCallback(async () => {
    setProcessing(true);
    setResults([]);
    const newResults: ExtractionResult[] = [];

    const queuedFiles = files.filter((f) => f.status === "queued");

    await processFiles(
      queuedFiles,
      (fileId, progress, statusText) => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, progress, status: "processing" as const, statusText }
              : f
          )
        );
      },
      (result) => {
        newResults.push(result);
        setResults([...newResults]);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === result.fileId
              ? { ...f, status: "complete" as const, progress: 100 }
              : f
          )
        );
      },
      (fileId, error) => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? { ...f, status: "error" as const, error }
              : f
          )
        );
      }
    );

    setProcessing(false);
  }, [files]);

  const hasQueued = files.some((f) => f.status === "queued");
  const hasAny = files.length > 0;

  return (
    <div className="min-h-full flex flex-col">
      <NavBar />

      <main className="mx-auto w-full max-w-3xl px-6 pt-10 pb-12 flex-1">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="font-serif text-[28px] font-bold text-warm-text leading-tight">
              DocExtract
            </h1>
            <p className="mt-2 text-[15px] text-warm-muted leading-relaxed">
              Extract text from legal documents entirely in your browser. Upload
              PDFs, Word documents, or text files and get structured output ready
              for AI analysis.
            </p>
          </div>

          <PrivacyBanner />

          {/* Drop zone */}
          <FileDropZone
            onFilesAdded={handleFilesAdded}
            disabled={processing}
          />

          {/* File list */}
          <FileList
            files={files}
            onRemove={handleRemove}
            processing={processing}
          />

          {/* Action buttons */}
          {hasAny && (
            <div className="flex items-center gap-3">
              {hasQueued && (
                <button
                  onClick={handleProcessAll}
                  disabled={processing}
                  className="inline-flex items-center gap-2 rounded-md bg-warm-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-warm-accent-light disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-warm-accent transition-colors"
                >
                  {processing ? (
                    <>
                      <Spinner /> Processing...
                    </>
                  ) : (
                    "Process All"
                  )}
                </button>
              )}
              {!processing && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-md border border-warm-border px-5 py-2.5 text-sm font-medium text-warm-body bg-transparent hover:bg-warm-white hover:border-warm-border-hover transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          )}

          {/* Processing progress */}
          {processing && <ProcessingStatus files={files} />}

          {/* Results */}
          <OutputPreview results={results} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
