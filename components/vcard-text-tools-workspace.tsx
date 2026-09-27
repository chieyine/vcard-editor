"use client";

import { useState } from "react";
import { downloadFile } from "../lib/download";
import { assertTextBudget, MAX_TEXT_CHARACTERS } from "../lib/file-guard";
import {
  foldVCardLines,
  generateSyntheticVCards,
  unfoldVCardLines,
} from "../lib/vcard-text-tools";

export default function VCardTextToolsWorkspace({
  mode,
}: {
  mode: "folder" | "unfolder" | "generator";
}) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [count, setCount] = useState(25);
  const [version, setVersion] = useState<"2.1" | "3.0" | "4.0">("3.0");
  const [status, setStatus] = useState(
    "Choose your options, then generate a preview.",
  );
  function run() {
    try {
      assertTextBudget(input);
      const next =
        mode === "folder"
          ? foldVCardLines(input)
          : mode === "unfolder"
            ? unfoldVCardLines(input)
            : generateSyntheticVCards(count, version);
      setOutput(next);
      setStatus("Preview ready. Download includes the complete result.");
    } catch (error) {
      setOutput("");
      setStatus(
        error instanceof Error ? error.message : "Could not process the text.",
      );
    }
  }
  return (
    <div className="creator-card">
      <div className="creator-toolbar">
        <div>
          <strong>
            {mode === "folder"
              ? "vCard line folder"
              : mode === "unfolder"
                ? "vCard line unfolder"
                : "Synthetic vCards"}
          </strong>
          <small aria-live="polite">{status}</small>
        </div>
        <button
          className="primary-button compact"
          disabled={!output}
          onClick={() =>
            downloadFile(
              output,
              mode === "unfolder" ? "unfolded-vcard.txt" : "contacts.vcf",
              "text/plain;charset=utf-8",
            )
          }
        >
          Download
        </button>
      </div>
      <section className="creator-form">
        {mode === "generator" ? (
          <div className="form-grid">
            <label>
              Contacts
              <input
                type="number"
                min={1}
                max={10000}
                value={count}
                onChange={(event) => {
                  setCount(
                    Math.max(
                      1,
                      Math.min(10000, Number(event.target.value) || 1),
                    ),
                  );
                  setOutput("");
                }}
              />
            </label>
            <label>
              Version
              <select
                value={version}
                onChange={(event) => {
                  setVersion(event.target.value as typeof version);
                  setOutput("");
                }}
              >
                <option value="2.1">vCard 2.1</option>
                <option value="3.0">vCard 3.0</option>
                <option value="4.0">vCard 4.0</option>
              </select>
            </label>
          </div>
        ) : (
          <label>
            Input vCard text
            <textarea
              maxLength={MAX_TEXT_CHARACTERS}
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                setOutput("");
              }}
              rows={12}
              spellCheck={false}
            />
          </label>
        )}
        <button className="secondary-button" onClick={run}>
          Generate preview
        </button>
        {output && (
          <label>
            Output preview (first 20,000 characters)
            <textarea
              value={output.slice(0, 20000)}
              readOnly
              rows={12}
              spellCheck={false}
            />
          </label>
        )}
      </section>
    </div>
  );
}
