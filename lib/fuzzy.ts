import type { Contact } from "./vcard";
import { normalizePhone } from "./contact-tools";

export type FuzzyMatch = { left: Contact; right: Contact; score: number; reasons: string[] };

function normalize(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

function jaroWinkler(left: string, right: string) {
  if (left === right) return left ? 1 : 0;
  if (!left || !right) return 0;
  const range = Math.max(0, Math.floor(Math.max(left.length, right.length) / 2) - 1);
  const leftMatches = new Array(left.length).fill(false); const rightMatches = new Array(right.length).fill(false);
  let matches = 0;
  for (let leftIndex = 0; leftIndex < left.length; leftIndex += 1) {
    const start = Math.max(0, leftIndex - range); const end = Math.min(right.length, leftIndex + range + 1);
    for (let rightIndex = start; rightIndex < end; rightIndex += 1) {
      if (rightMatches[rightIndex] || left[leftIndex] !== right[rightIndex]) continue;
      leftMatches[leftIndex] = true; rightMatches[rightIndex] = true; matches += 1; break;
    }
  }
  if (!matches) return 0;
  let transpositions = 0; let rightIndex = 0;
  for (let leftIndex = 0; leftIndex < left.length; leftIndex += 1) {
    if (!leftMatches[leftIndex]) continue;
    while (!rightMatches[rightIndex]) rightIndex += 1;
    if (left[leftIndex] !== right[rightIndex]) transpositions += 1;
    rightIndex += 1;
  }
  const jaro = (matches / left.length + matches / right.length + (matches - transpositions / 2) / matches) / 3;
  let prefix = 0; while (prefix < Math.min(4, left.length, right.length) && left[prefix] === right[prefix]) prefix += 1;
  return jaro + prefix * 0.1 * (1 - jaro);
}

function label(contact: Contact) { return normalize(contact.formattedName || [contact.firstName, contact.lastName].filter(Boolean).join(" ")); }
function emailParts(contact: Contact) { return contact.emails.map((email) => email.trim().toLowerCase().split("@")).filter((parts) => parts.length === 2); }

function blockingKeys(contact: Contact) {
  const keys = new Set<string>(); const name = label(contact); const tokens = name.split(" ").filter(Boolean);
  if (tokens.length) { keys.add(`name:${tokens[0].slice(0, 3)}:${tokens.at(-1)?.slice(0, 3)}`); keys.add(`surname:${tokens.at(-1)?.slice(0, 4)}`); }
  const organisation = normalize(contact.organisation); if (organisation) keys.add(`org:${organisation.slice(0, 6)}`);
  contact.phones.forEach((phone) => { const digits = normalizePhone(phone).replace(/\D/g, ""); if (digits.length >= 7) keys.add(`phone:${digits.slice(-7)}`); });
  emailParts(contact).forEach(([local, domain]) => { keys.add(`domain:${domain}`); if (local.length >= 3) keys.add(`email:${local.slice(0, 4)}:${domain}`); });
  return keys;
}

function scorePair(left: Contact, right: Contact) {
  const reasons: string[] = []; const leftName = label(left); const rightName = label(right); const nameScore = jaroWinkler(leftName, rightName);
  const leftPhones = new Set(left.phones.map((phone) => normalizePhone(phone).replace(/\D/g, "")).filter((value) => value.length >= 7));
  const sharedPhone = right.phones.some((phone) => leftPhones.has(normalizePhone(phone).replace(/\D/g, "")));
  const leftEmails = new Set(left.emails.map((email) => email.trim().toLowerCase())); const sharedEmail = right.emails.some((email) => leftEmails.has(email.trim().toLowerCase()));
  const organisationScore = jaroWinkler(normalize(left.organisation), normalize(right.organisation));
  const leftEmailParts = emailParts(left); const rightEmailParts = emailParts(right);
  const emailSimilarity = Math.max(0, ...leftEmailParts.flatMap(([local, domain]) => rightEmailParts.filter(([, otherDomain]) => domain === otherDomain).map(([otherLocal]) => jaroWinkler(local, otherLocal))));
  let score = nameScore * 0.5 + organisationScore * 0.12 + emailSimilarity * 0.18;
  if (sharedPhone) { score += 0.42; reasons.push("same normalized phone"); }
  if (sharedEmail) { score += 0.48; reasons.push("same email address"); }
  if (nameScore >= 0.9) reasons.push("very similar names"); else if (nameScore >= 0.78) reasons.push("similar names");
  if (organisationScore >= 0.88 && left.organisation && right.organisation) reasons.push("similar organizations");
  if (!sharedEmail && emailSimilarity >= 0.88) reasons.push("similar email names on the same domain");
  return { score: Math.min(1, score), reasons };
}

export function findFuzzyMatches(contacts: Contact[], threshold = 0.68, maxComparisons = 50000) {
  const buckets = new Map<string, number[]>();
  contacts.forEach((contact, index) => blockingKeys(contact).forEach((key) => { const values = buckets.get(key) ?? []; if (values.length < 200) values.push(index); buckets.set(key, values); }));
  const pairs = new Set<string>(); let comparisons = 0;
  for (const values of buckets.values()) {
    for (let left = 0; left < values.length; left += 1) for (let right = left + 1; right < values.length; right += 1) {
      if (comparisons >= maxComparisons) break;
      const first = Math.min(values[left], values[right]); const second = Math.max(values[left], values[right]);
      const signature = `${first}:${second}`;
      if (!pairs.has(signature)) { pairs.add(signature); comparisons += 1; }
    }
    if (comparisons >= maxComparisons) break;
  }
  const matches: FuzzyMatch[] = [];
  pairs.forEach((pair) => { const [leftIndex, rightIndex] = pair.split(":").map(Number); const result = scorePair(contacts[leftIndex], contacts[rightIndex]); if (result.score >= threshold) matches.push({ left: contacts[leftIndex], right: contacts[rightIndex], score: Math.round(result.score * 100), reasons: result.reasons }); });
  return { matches: matches.sort((a, b) => b.score - a.score), comparisons, capped: comparisons >= maxComparisons };
}
