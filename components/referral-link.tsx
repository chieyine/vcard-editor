"use client";

import { trackEvent } from "../lib/analytics";

export default function ReferralLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return <a className={className} href={href} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("happycsv_referral_clicked", { source: "homepage" })}>{children}</a>;
}
