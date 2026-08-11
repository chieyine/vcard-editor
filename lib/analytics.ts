"use client";

import { analyticsEnabled } from "./feature-flags";

export type AnalyticsEventName =
  | "page_view"
  | "site_search"
  | "sample_loaded"
  | "file_selected"
  | "parse_started"
  | "parse_succeeded"
  | "parse_failed"
  | "preview_generated"
  | "tool_run_started"
  | "tool_run_succeeded"
  | "tool_run_failed"
  | "validation_opened"
  | "repair_applied"
  | "duplicate_review_started"
  | "duplicate_decision_completed"
  | "export_options_opened"
  | "download_clicked"
  | "related_tool_clicked"
  | "happycsv_referral_clicked"
  | "consent_updated";

export type AnalyticsPropertyKey = "tool_slug" | "input_format" | "output_format" | "source" | "size_bucket" | "contact_count_bucket" | "duration_bucket" | "error_code" | "device_class" | "path" | "enabled";
export type AnalyticsProperties = Partial<Record<AnalyticsPropertyKey, string | number | boolean>>;

const allowedKeys = new Set<AnalyticsPropertyKey>(["tool_slug", "input_format", "output_format", "source", "size_bucket", "contact_count_bucket", "duration_bucket", "error_code", "device_class", "path", "enabled"]);

function safeProperties(properties: AnalyticsProperties = {}) {
  return Object.fromEntries(Object.entries(properties).filter(([key, value]) => allowedKeys.has(key as AnalyticsPropertyKey) && (typeof value === "string" || typeof value === "number" || typeof value === "boolean")));
}

/**
 * Emits a privacy-safe local event. A provider can subscribe to this event later;
 * Phase 7 deliberately ships with collection disabled by default and never sends
 * contact data, filenames, or file contents.
 */
export function trackEvent(name: AnalyticsEventName, properties: AnalyticsProperties = {}) {
  if (!analyticsEnabled || typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("vcardeditor:analytics", { detail: { name, properties: safeProperties(properties), timestamp: Date.now() } }));
}

export function trackPageView(pathname: string) {
  trackEvent("page_view", { path: pathname.slice(0, 120) });
}
