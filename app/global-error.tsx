"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="en"><body><main className="not-found"><p className="eyebrow">TEMPORARY ERROR</p><h1>vCard Editor could not load.</h1><p>Refresh the page to try again.</p><button className="primary-button" onClick={() => reset()}>Refresh workspace</button></main></body></html>;
}
