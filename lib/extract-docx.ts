import mammoth from "mammoth";
import type { PageResult } from "./types";

export async function extractDocx(file: File): Promise<PageResult[]> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  const text = result.value;
  return [{ pageNumber: 1, text, method: "native", charCount: text.length }];
}
