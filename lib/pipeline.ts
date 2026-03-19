import { extractPdf } from "./extract-pdf";
import { extractDocx } from "./extract-docx";
import { extractTxt, extractHtml } from "./extract-text";
import { terminateWorker } from "./ocr";
import type {
  QueuedFile,
  ExtractionResult,
  PageResult,
  ProgressCallback,
  ExtractionMethod,
} from "./types";

export async function processFiles(
  files: QueuedFile[],
  onProgress: ProgressCallback,
  onFileComplete: (result: ExtractionResult) => void,
  onFileError: (fileId: string, error: string) => void
): Promise<void> {
  for (const qf of files) {
    const startTime = performance.now();
    onProgress(qf.id, 0, `Starting ${qf.name}...`);

    try {
      let pages: PageResult[];

      switch (qf.type) {
        case "pdf":
          pages = await extractPdf(qf.file, (progress, status) => {
            onProgress(qf.id, progress, status);
          });
          break;
        case "docx":
          onProgress(qf.id, 50, "Extracting text...");
          pages = await extractDocx(qf.file);
          break;
        case "txt":
          onProgress(qf.id, 50, "Reading file...");
          pages = await extractTxt(qf.file);
          break;
        case "html":
          onProgress(qf.id, 50, "Parsing HTML...");
          pages = await extractHtml(qf.file);
          break;
        default:
          throw new Error(`Unsupported file type: ${qf.type}`);
      }

      const totalChars = pages.reduce((sum, p) => sum + p.charCount, 0);
      const methods = new Set(pages.map((p) => p.method));
      let overallMethod: ExtractionMethod = "native";
      if (methods.has("ocr") && methods.has("native")) overallMethod = "mixed";
      else if (methods.has("ocr")) overallMethod = "ocr";

      onFileComplete({
        fileId: qf.id,
        fileName: qf.name,
        relativePath: qf.relativePath,
        fileType: qf.type,
        pages,
        totalCharacters: totalChars,
        totalPages: pages.length,
        method: overallMethod,
        extractionTimeMs: performance.now() - startTime,
      });

      onProgress(qf.id, 100, "Complete");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Extraction failed";
      onFileError(qf.id, msg);
    }
  }

  await terminateWorker();
}
