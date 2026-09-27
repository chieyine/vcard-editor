import { contactChanges } from "../lib/contact-changes";
import type { Contact } from "../lib/vcard";
import { useMemo } from "react";
import { downloadFile } from "../lib/download";

export default function ContactChangePreview({
  before,
  after,
}: {
  before: Contact[];
  after: Contact[];
}) {
  const changes = useMemo(() => contactChanges(before, after), [before, after]);
  return (
    <section className="operation-section">
      <h2>
        {changes.length} field changes · {after.length} contacts in output
      </h2>
      <p className="mapping-note">
        Showing the first 50 field changes. Reordering cards does not change
        their fields.
      </p>
      {changes.length > 50 && (
        <button
          className="text-button"
          onClick={() =>
            downloadFile(
              changes
                .map(
                  (item) =>
                    `${item.name} — ${item.field}\nBefore: ${item.before}\nAfter: ${item.after}`,
                )
                .join("\n\n"),
              "contact-changes.txt",
              "text/plain;charset=utf-8",
            )
          }
        >
          Download all changes
        </button>
      )}
      <div className="preview-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Contact / field</th>
              <th>Before</th>
              <th>After</th>
            </tr>
          </thead>
          <tbody>
            {changes.slice(0, 50).map((item, index) => (
              <tr key={index}>
                <td>
                  {item.name} · {item.field}
                </td>
                <td>{item.before.slice(0, 240) || "—"}</td>
                <td>{item.after.slice(0, 240) || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
