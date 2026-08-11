# Privacy architecture

The public site contains documentation, navigation, and tool entry points. Processing components read selected files through browser APIs and generate outputs locally.

The processing boundary must not record or transmit contact names, phone numbers, email addresses, notes, photos, filenames, raw vCard lines, mappings, or exported content.

Local browser state may later hold preferences or explicitly opted-in recovery drafts. It must be versioned, disclosed, clearable, and never synced or used for profiling.

If analytics, consent management, advertising, or error monitoring is introduced, the private processing surface must remain isolated from those scripts and all event properties must be bucketed and contact-free.
