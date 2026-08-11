"use client";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  void error;
  return <main className="not-found"><p className="eyebrow">TEMPORARY ERROR</p><h1>This workspace hit a problem.</h1><p>Nothing was uploaded. Try the page again, or return to the editor.</p><button className="primary-button" onClick={() => reset()}>Try again</button></main>;
}
