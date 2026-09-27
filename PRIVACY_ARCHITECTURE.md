# Privacy architecture

The public site serves documents and assets. Tool components read selected files and generate downloads in the browser. There is no contact-upload endpoint, account system or contact-storage backend.

Contact names, phone numbers, email addresses, notes, photos, filenames, raw vCard lines, mappings and exported content must not be sent to telemetry or application logs.

The editor keeps one current session, undo history and raw draft in tab memory so internal navigation and Back/Forward do not discard work. Open another clears that session; a full reload or closing the tab also clears it. Drafts are not written to localStorage, IndexedDB, cookies or the service-worker cache. Downloaded files remain under the user's control.

No analytics or advertising provider is mounted. `NEXT_PUBLIC_ANALYTICS_ENABLED` defaults to false; when true, it emits allowlisted, local browser diagnostic events only. There is no network bridge. An allowlist is not isolation: introducing third-party collection requires a separate design and updated public disclosure.

The service worker caches public static assets and a simple offline page only. HTML documents use request-specific CSP nonces and are not cached. Website requests still reach the host; local contact processing does not conceal ordinary hosting logs, browser history or extensions.
