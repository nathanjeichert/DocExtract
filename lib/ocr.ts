import Tesseract from "tesseract.js";

let workerInstance: Tesseract.Worker | null = null;

async function getWorker(
  onProgress?: (progress: number) => void
): Promise<Tesseract.Worker> {
  if (!workerInstance) {
    workerInstance = await Tesseract.createWorker("eng", 1, {
      logger: (info) => {
        if (info.status === "recognizing text" && onProgress) {
          onProgress(info.progress);
        }
      },
    });
  }
  return workerInstance;
}

export async function ocrCanvas(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  onProgress?: (progress: number) => void
): Promise<string> {
  const worker = await getWorker(onProgress);
  const {
    data: { text },
  } = await worker.recognize(canvas as HTMLCanvasElement);
  return text;
}

export async function terminateWorker(): Promise<void> {
  if (workerInstance) {
    await workerInstance.terminate();
    workerInstance = null;
  }
}
