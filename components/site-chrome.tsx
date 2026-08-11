import Link from "next/link";

export function SiteHeader() {
  return (
    <>
      <a className="skip-link" href="#content">Skip to main content</a>
      <header className="site-header">
      <Link className="brand" href="/" aria-label="vCard Editor home">
        <span className="brand-mark" aria-hidden="true">✦</span>
        <span>vCard Editor</span>
      </Link>
      <nav className="header-nav" aria-label="Primary navigation">
        <Link href="/tool/vcf-editor">Editor</Link>
        <Link href="/tools">Tools</Link>
        <Link href="/tool/vcf-to-csv">Convert</Link>
        <Link href="/tool/contact-cleaner">Clean &amp; repair</Link>
        <Link href="/guide">Guides</Link>
        <Link href="/how-it-works">How it works</Link>
      </nav>
      <span className="privacy-pill"><span aria-hidden="true">●</span> Private by design</span>
      <details className="mobile-menu"><summary aria-label="Open navigation">Menu</summary><nav aria-label="Mobile navigation"><Link href="/tool/vcf-editor">Editor</Link><Link href="/tools">All tools</Link><Link href="/tool/vcf-to-csv">Convert</Link><Link href="/tool/contact-cleaner">Clean &amp; repair</Link><Link href="/guide">Guides</Link><Link href="/how-it-works">How it works</Link></nav></details>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>© 2026 vCard Editor</span>
      <span>Local-first contact tools for real-world files.</span>
      <span className="footer-links">
        <Link href="/tools">Tools</Link>
        <Link href="/guide">Guides</Link>
        <Link href="/format">Formats</Link>
        <Link href="/about">About</Link>
        <Link href="/author">Author</Link>
        <Link href="/how-it-works">How it works</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/cookies">Cookies</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/security">Security</Link>
        <Link href="/browser-support">Browser support</Link>
        <Link href="/accessibility">Accessibility</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/changelog">Changelog</Link>
        <Link href="/sitemap">Sitemap</Link>
      </span>
    </footer>
  );
}

export function InfoPage({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: React.ReactNode }) {
  return (
    <main>
      <SiteHeader />
      <article className="info-page" id="content">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="info-intro">{intro}</p>
        <div className="info-content">{children}</div>
      </article>
      <SiteFooter />
    </main>
  );
}
