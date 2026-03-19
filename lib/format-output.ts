import type { ExtractionResult } from "./types";

const METHOD_LABELS: Record<string, string> = {
  native: "Native text extraction",
  ocr: "OCR (Tesseract)",
  mixed: "Mixed (native + OCR)",
};

export function formatSingleFile(result: ExtractionResult): string {
  const lines: string[] = [];
  lines.push(`=== Document: ${result.fileName} ===`);
  lines.push(
    `Pages: ${result.totalPages} | Method: ${METHOD_LABELS[result.method]} | Characters: ${result.totalCharacters.toLocaleString()}`
  );
  lines.push("");

  for (const page of result.pages) {
    if (result.totalPages > 1) {
      lines.push(`--- Page ${page.pageNumber} ---`);
      lines.push("");
    }
    lines.push(page.text.trim());
    lines.push("");
  }

  return lines.join("\n");
}

export function formatCombined(results: ExtractionResult[]): string {
  const sections: string[] = [];
  const totalChars = results.reduce((s, r) => s + r.totalCharacters, 0);
  const date = new Date().toISOString().split("T")[0];

  sections.push(`# Extracted Documents`);
  sections.push(
    `Date: ${date} | Files: ${results.length} | Total Characters: ${totalChars.toLocaleString()} | Est. Tokens: ~${estimateTokens(totalChars).toLocaleString()}`
  );
  sections.push("");

  for (const result of results) {
    sections.push(formatSingleFile(result));
  }

  return sections.join("\n");
}

export function estimateTokens(chars: number): number {
  return Math.ceil(chars / 4);
}

const CHARS_PER_CHUNK = 400_000; // ~100K tokens

export function splitIntoChunks(results: ExtractionResult[]): string[] {
  // Build a flat list of (text, label) segments
  const segments: { label: string; text: string }[] = [];
  for (const result of results) {
    for (const page of result.pages) {
      const label =
        result.totalPages > 1
          ? `=== Document: ${result.fileName} (Page ${page.pageNumber}/${result.totalPages}) ===`
          : `=== Document: ${result.fileName} ===`;
      segments.push({ label, text: page.text.trim() });
    }
  }

  const chunks: string[] = [];
  let current = "";

  for (const seg of segments) {
    const block = `${seg.label}\n\n${seg.text}\n\n`;
    if (current.length + block.length > CHARS_PER_CHUNK && current.length > 0) {
      chunks.push(current.trim());
      current = "";
    }
    current += block;
  }

  if (current.trim().length > 0) {
    chunks.push(current.trim());
  }

  return chunks.length > 0 ? chunks : [""];
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
