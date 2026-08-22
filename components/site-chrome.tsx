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
        <Link href="/guide">Guides</Link>
        <details className="header-more">
          <summary>More</summary>
          <nav aria-label="Secondary navigation">
            <Link href="/tool/contact-cleaner">Clean &amp; repair</Link>
            <Link href="/tool/merge-vcf">Organise</Link>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/format">Formats</Link>
          </nav>
        </details>
      </nav>
      <span className="privacy-pill"><span aria-hidden="true">●</span> Private by design</span>
      <details className="mobile-menu"><summary aria-label="Open navigation">Menu</summary><nav aria-label="Mobile navigation"><strong>Start here</strong><Link href="/tool/vcf-editor">Editor</Link><Link href="/tools">All tools</Link><strong>Workflows</strong><Link href="/tool/vcf-to-csv">Convert</Link><Link href="/tool/contact-cleaner">Clean &amp; repair</Link><Link href="/tool/merge-vcf">Organise</Link><strong>Learn</strong><Link href="/guide">Guides</Link><Link href="/how-it-works">How it works</Link><Link href="/format">Formats</Link></nav></details>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="footer-brand">
          <Link className="brand" href="/" aria-label="vCard Editor home"><span className="brand-mark" aria-hidden="true">✦</span><span>vCard Editor</span></Link>
          <p>Local-first contact tools for real-world files.</p>
          <p className="footer-privacy-note">Files are processed in your browser. Your contact data is not sent to an application server for these tools.</p>
        </div>
        <nav className="footer-nav" aria-label="Footer navigation">
          <div><h2>Workflows</h2><Link href="/tools">All tools</Link><Link href="/guide">Guides</Link><Link href="/format">Formats</Link><Link href="/how-it-works">How it works</Link></div>
          <div><h2>About</h2><Link href="/about">About</Link><Link href="/author">Author</Link><Link href="/changelog">Changelog</Link></div>
          <div><h2>Trust &amp; support</h2><Link href="/security">Security</Link><Link href="/browser-support">Browser support</Link><Link href="/accessibility">Accessibility</Link><Link href="/contact">Contact</Link></div>
          <div><h2>Policies</h2><Link href="/privacy">Privacy</Link><Link href="/cookies">Cookies</Link><Link href="/terms">Terms</Link><Link href="/sitemap">HTML sitemap</Link></div>
        </nav>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} vCard Editor</span><span>Built for careful contact-file work.</span></div>
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
