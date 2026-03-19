export type FileType = "pdf" | "docx" | "txt" | "html";

export type ExtractionMethod = "native" | "ocr" | "mixed";

export type FileStatus = "queued" | "processing" | "complete" | "error";

export interface QueuedFile {
  id: string;
  file: File;
  name: string;
  relativePath: string;
  size: number;
  type: FileType;
  status: FileStatus;
  progress: number;
  statusText?: string;
  error?: string;
}

export interface PageResult {
  pageNumber: number;
  text: string;
  method: ExtractionMethod;
  charCount: number;
}

export interface ExtractionResult {
  fileId: string;
  fileName: string;
  relativePath: string;
  fileType: FileType;
  pages: PageResult[];
  totalCharacters: number;
  totalPages: number;
  method: ExtractionMethod;
  extractionTimeMs: number;
}

export type ProgressCallback = (
  fileId: string,
  progress: number,
  statusText?: string
) => void;
