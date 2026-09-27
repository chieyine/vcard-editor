import { version } from "../package.json";

export const release = {
  version,
  date: "2026-09-27",
  phase: 7,
  channel: "beta",
  analytics: "disabled-by-default",
  ads: "disabled-by-default",
} as const;
