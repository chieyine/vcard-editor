import { Contact, serializeVCards } from "./vcard";

export function unfoldVCardLines(text: string) { return text.replace(/\r\n|\r|\n/g, "\n").split("\n").reduce<string[]>((lines, line) => { if (/^[ \t]/.test(line) && lines.length) lines[lines.length - 1] += line.slice(1); else lines.push(line); return lines; }, []).join("\r\n"); }

export function foldVCardLines(text: string, width = 75) {
  return unfoldVCardLines(text).split("\r\n").map((line) => { if (line.length <= width) return line; const pieces: string[] = []; let rest = line; while (rest.length > width) { pieces.push(rest.slice(0, width)); rest = ` ${rest.slice(width)}`; } pieces.push(rest); return pieces.join("\r\n"); }).join("\r\n");
}

function syntheticContact(index: number): Contact { const firstNames = ["Ada", "Kojo", "Mina", "Sam"]; const lastNames = ["Okafor", "Mensah", "Chen", "Rivera"]; const firstName = firstNames[index % firstNames.length]; const lastName = lastNames[index % lastNames.length]; return { id: `synthetic-${index + 1}`, version: "3.0", firstName, lastName, formattedName: `${firstName} ${lastName} ${index + 1}`, phones: [`+1 555 01${String(index).padStart(2, "0")}`], emails: [`contact-${index + 1}@example.test`], organisation: index % 2 ? "Northstar Studio" : "Example Labs", title: "Synthetic contact", note: "Generated locally for testing.", uid: `urn:uuid:synthetic-${index + 1}`, categories: [index % 2 ? "work" : "sample"], photo: "", rawProperties: [], properties: [], issues: [] }; }

export function generateSyntheticVCards(count: number, version: "2.1" | "3.0" | "4.0" = "3.0") { return serializeVCards(Array.from({ length: Math.max(1, Math.min(10000, Math.floor(count))) }, (_, index) => syntheticContact(index)), { version, preserveUnknown: false, includePhotos: false }); }
