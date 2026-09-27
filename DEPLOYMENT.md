# Deployment guide

Use Node 24 with a supported Next.js server deployment. Contact processing stays in the browser, but HTML is rendered per request to support fresh CSP nonces. Static export and shared HTML/CDN caching are not supported by this configuration.

## Configuration

Set `NEXT_PUBLIC_SITE_URL` to the canonical HTTPS URL. Support defaults to `support@vcardeditor.com`; override it with `NEXT_PUBLIC_SUPPORT_EMAIL` if necessary. Analytics, ads and monitoring remain disabled by default. The analytics flag currently enables local diagnostic events only.

Set `VERCEL_ENV=preview` or `NEXT_PUBLIC_DEPLOY_ENV=preview` for previews. Vercel supplies its own environment value. Preview metadata is noindex, robots disallows crawling, and the sitemap is empty.

## Content security policy

`proxy.ts` creates a nonce, forwards it with the request CSP, and applies the same policy to the response. The root layout uses `connection()` for per-request rendering; JSON-LD reads the nonce from request headers. Production scripts use nonces and strict-dynamic. Development alone permits eval for tooling. Inline styles remain permitted for the existing interface.

HTML responses are private/no-store. Do not override this with a CDN document cache. Static assets remain cacheable. The service worker deliberately does not cache document HTML; disconnected navigations use `offline.html`. There is no build-time hash catalogue and no mutation of Next's internal manifests.

## Release verification

The audit implementation was checked statically; no production build, browser tests or host verification was performed during that work. Before release, run the repository's normal CI and inspect the actual deployment:

1. Check ordinary pages, an unknown route, error responses and client navigation for CSP violations and matching nonces.
2. Confirm CSP header size stays bounded, nonces differ across requests, and HTML is not served from a shared cache.
3. Check editor draft recovery, downloads, cancel/reopen flows, keyboard navigation and camera cleanup using synthetic data.
4. Verify Chromium, Firefox and WebKit. The configuration now enables WebKit on CI; configuration is not a successful run.
5. Check canonical metadata, HTTPS, robots and sitemap, and confirm the browser sends no contact data to the server.

Keep a rollback deployment. External address-book imports are recorded separately on `/platform/compatibility-matrix`; current destination verification is not claimed.
