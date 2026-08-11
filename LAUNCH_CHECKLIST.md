# Launch checklist

## Before deploy

- [ ] Production domain and HTTPS redirect are configured.
- [ ] Production branch is protected and deployment MFA is enabled.
- [ ] Production environment variables are set; analytics and ads remain disabled unless approved.
- [ ] Privacy, security, terms, cookies, accessibility, and contact pages are published.
- [ ] `npm run typecheck`, `npm test`, compatibility, benchmark, and build pass.

## Search and release

- [ ] Production is indexable; previews are noindex and disallowed in `robots.txt`.
- [ ] Sitemap is submitted to Google Search Console and Bing Webmaster Tools.
- [ ] IndexNow is configured only if its key is present and verified.
- [ ] Initial changelog and release metadata are published.

## Product smoke test

- [ ] Homepage and tools directory load on desktop and mobile.
- [ ] Sample contacts load, edit, and export successfully.
- [ ] VCF, CSV, and Excel conversion routes download valid files.
- [ ] Merge, split, dedupe, cleaner, validator, repair, extraction, normalization, and photo-removal tools work with synthetic data.
- [ ] Files over 25 MB are refused and large files show a warning.
- [ ] Browser network inspection shows no contact upload.
- [ ] Offline PWA shell installs and reloads the cached shell without changing local-processing behaviour.
- [ ] Error/uptime monitoring and rollback path are ready.

## First 90 days

- [ ] Days 1–7: inspect errors, downloads, uptime, search indexing, and compatibility reports.
- [ ] Days 8–30: address query gaps and browser/large-file friction.
- [ ] Days 31–60: consider an encoding fixer, compare tool, and mapping presets.
- [ ] Days 61–90: evaluate monetization only after a privacy and performance review.
