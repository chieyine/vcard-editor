import { decodeVCardBytes, parseVCard } from "./vcard";

type WorkerRequest = { type: "PARSE"; jobId: string; buffer: ArrayBuffer } | { type: "CANCEL"; jobId: string };
type WorkerResponse = { type: "RESULT"; jobId: string; payload: ReturnType<typeof parseVCard> & { encoding: ReturnType<typeof decodeVCardBytes>["encoding"] } } | { type: "PROGRESS"; jobId: string; percent: number } | { type: "ERROR"; jobId: string; message: string };

const workerScope = self as unknown as { onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null; postMessage: (message: WorkerResponse) => void };
workerScope.onmessage = (event) => {
  if (event.data.type === "CANCEL") return;
  try {
    workerScope.postMessage({ type: "PROGRESS", jobId: event.data.jobId, percent: 10 });
    const decoded = decodeVCardBytes(event.data.buffer);
    workerScope.postMessage({ type: "PROGRESS", jobId: event.data.jobId, percent: 45 });
    const parsed = parseVCard(decoded.text);
    workerScope.postMessage({ type: "PROGRESS", jobId: event.data.jobId, percent: 90 });
    workerScope.postMessage({ type: "RESULT", jobId: event.data.jobId, payload: { ...parsed, encoding: decoded.encoding } });
  } catch (error) {
    workerScope.postMessage({ type: "ERROR", jobId: event.data.jobId, message: error instanceof Error ? error.message : "The file could not be parsed." });
  }
};

export {};
