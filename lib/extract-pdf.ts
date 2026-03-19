import * as pdfjsLib from "pdfjs-dist";
import type { PageResult } from "./types";
import { ocrCanvas } from "./ocr";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

const CHARS_PER_PAGE_THRESHOLD = 1000;
const OCR_RENDER_SCALE = 2.0;

export async function extractPdf(
  file: File,
  onProgress: (progress: number, status: string) => void
): Promise<PageResult[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) })
    .promise;
  const totalPages = pdf.numPages;
  const pages: PageResult[] = [];
  const pagesNeedingOcr: number[] = [];

  // Phase 1: Native text extraction
  for (let i = 1; i <= totalPages; i++) {
    onProgress(
      Math.round((i / totalPages) * 40),
      `Extracting text from page ${i}/${totalPages}...`
    );
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const textParts: string[] = [];
    for (const item of textContent.items) {
      if ("str" in item) {
        textParts.push(item.str);
        if ("hasEOL" in item && item.hasEOL) {
          textParts.push("\n");
        }
      }
    }
    const text = textParts.join("").trim();
    const charCount = text.length;

    pages.push({
      pageNumber: i,
      text,
      method: "native",
      charCount,
    });

    if (charCount < CHARS_PER_PAGE_THRESHOLD) {
      pagesNeedingOcr.push(i);
    }
  }

  // Phase 2: OCR for low-density pages
  if (pagesNeedingOcr.length > 0) {
    for (let j = 0; j < pagesNeedingOcr.length; j++) {
      const pageNum = pagesNeedingOcr[j];
      onProgress(
        40 + Math.round(((j + 1) / pagesNeedingOcr.length) * 55),
        `OCR page ${pageNum}/${totalPages}...`
      );

      try {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: OCR_RENDER_SCALE });

        const canvas =
          typeof OffscreenCanvas !== "undefined"
            ? new OffscreenCanvas(viewport.width, viewport.height)
            : document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        await page.render({
          canvasContext: ctx as CanvasRenderingContext2D,
          viewport,
        }).promise;

        const ocrText = await ocrCanvas(canvas);

        // Use whichever extraction yielded more text
        const pageResult = pages[pageNum - 1];
        if (ocrText.trim().length > pageResult.text.trim().length) {
          pageResult.text = ocrText.trim();
          pageResult.method = "ocr";
          pageResult.charCount = ocrText.trim().length;
        }

        // Free memory
        canvas.width = 0;
        canvas.height = 0;
      } catch (err) {
        console.warn(`OCR failed for page ${pageNum}:`, err);
        // Keep native extraction result
      }
    }
  }

  onProgress(100, "Complete");
  return pages;
}
