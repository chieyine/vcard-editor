import type { Contact, ParseResult } from "./vcard";

export type EditorSession = {
  contacts: Contact[];
  savedContacts: Contact[] | null;
  past: Contact[][];
  future: Contact[][];
  parseResult: ParseResult | null;
  selectedId: string | null;
  selectedIds: Set<string>;
  fileName: string;
  rawDraft: string;
  rawBaseline: string;
  showRaw: boolean;
};

// One in-memory draft per tab, retained across client navigation only.
// Writes happen in a client effect. Nothing is stored on disk or sent to a server.
let snapshot: EditorSession | null = null;
export function readEditorSession() {
  return typeof window === "undefined" ? null : snapshot;
}
export function saveEditorSession(value: EditorSession) {
  if (typeof window !== "undefined")
    snapshot = value.parseResult ? value : null;
}
