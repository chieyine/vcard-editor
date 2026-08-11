# Deployment guide

Phase 7 targets a small, reversible production launch. The application is static-first and processes contact files in the browser; no server-side contact processing is required.

## Environment

Copy `.env.example` to the deployment environment. Keep private values (for example `SENTRY_DSN` and `INDEXNOW_KEY`) server-only. Set `NEXT_PUBLIC_SITE_URL` to the canonical production URL and leave analytics and ads set to `false` until their privacy and consent review is complete.

Preview deployments must set `VERCEL_ENV=preview` (Vercel does this automatically) or `NEXT_PUBLIC_DEPLOY_ENV=preview`. Preview metadata is noindex, `robots.txt` disallows crawling, and the preview sitemap is empty.

## Vercel launch

1. Import the repository and use the default Next.js build settings.
2. Add production environment variables, then protect the production branch and require MFA for the deployment account.
3. Confirm the production domain, HTTPS redirect, canonical metadata, `robots.txt`, and `sitemap.xml`.
4. Register the production property in Google Search Console and Bing Webmaster Tools.
5. Run the smoke checks below from the deployed URL. Keep a rollback deployment available.

## Local release checks

```text
npm ci
npm run typecheck
npm test
npm run compatibility
npm run benchmark
npm run build
```

After deployment, verify the homepage, every tool route, sample loading, a synthetic VCF download, mobile layout, Safari compatibility, and the large-file warning. Inspect the browser network panel to confirm no contact data leaves the page.

