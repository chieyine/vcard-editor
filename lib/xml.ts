import {
  DOMParser,
  type Document,
  type Element,
  type Node,
} from "@xmldom/xmldom";

export type { Document, Element } from "@xmldom/xmldom";

/** A strict, local-only XML parser shared by browser tools and Node tooling. */
export function parseXml(source: string): Document {
  if (/<!DOCTYPE|<!ENTITY/i.test(source))
    throw new Error("XML document types and entities are unsupported.");
  return new DOMParser({
    onError: () => {
      throw new Error("The file contains malformed XML.");
    },
  }).parseFromString(source, "application/xml");
}

export function childElements(node?: Node | null): Element[] {
  return Array.from(node?.childNodes ?? []).filter(
    (child): child is Element => child.nodeType === 1,
  );
}
