import JSZip from "jszip";
import type { ExtractionResult } from "./types";
import { formatSingleFile, splitIntoChunks } from "./format-output";

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function downloadIndividualZip(
  results: ExtractionResult[]
): Promise<void> {
  const zip = new JSZip();

  for (const result of results) {
    const text = formatSingleFile(result);
    const stem = result.fileName.replace(/\.[^.]+$/, "");

    // Preserve folder structure from relativePath
    const dir = result.relativePath.includes("/")
      ? result.relativePath.substring(
          0,
          result.relativePath.lastIndexOf("/")
        ) + "/"
      : "";

    zip.file(`${dir}${stem}.txt`, text);
  }

  const blob = await zip.generateAsync({ type: "blob" });
  triggerDownload(blob, `extracted-files-${Date.now()}.zip`);
}

export async function downloadCombinedChunks(
  results: ExtractionResult[]
): Promise<void> {
  const chunks = splitIntoChunks(results);

  if (chunks.length === 1) {
    // Single file, no zip needed
    const blob = new Blob([chunks[0]], { type: "text/plain" });
    triggerDownload(blob, `extracted-combined.txt`);
    return;
  }

  const zip = new JSZip();
  chunks.forEach((chunk, i) => {
    zip.file(`combined-part-${i + 1}.txt`, chunk);
  });

  const blob = await zip.generateAsync({ type: "blob" });
  triggerDownload(blob, `extracted-combined-${Date.now()}.zip`);
}
