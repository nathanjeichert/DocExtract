import type { PageResult } from "./types";

export async function extractTxt(file: File): Promise<PageResult[]> {
  const text = await file.text();
  return [{ pageNumber: 1, text, method: "native", charCount: text.length }];
}

export async function extractHtml(file: File): Promise<PageResult[]> {
  const html = await file.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  doc.querySelectorAll("script, style, noscript").forEach((el) => el.remove());
  const text = doc.body?.textContent?.trim() ?? "";
  return [{ pageNumber: 1, text, method: "native", charCount: text.length }];
}
