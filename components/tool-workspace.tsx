"use client";

import dynamic from "next/dynamic";
import type { ToolWorkspace as Workspace } from "../lib/tools-registry";

const Editor = dynamic(() => import("./vcard-editor"));
const Viewer = dynamic(() => import("./vcard-viewer"));
const Creator = dynamic(() => import("./vcard-creator"));
const ContactTools = dynamic(() => import("./contact-tools-workspace"));
const Conversion = dynamic(() => import("./conversion-workspace"));
const Standards = dynamic(() => import("./standards-workspace"));
const TextTools = dynamic(() => import("./vcard-text-tools-workspace"));
const Transform = dynamic(() => import("./vcard-transform-workspace"));
const Qr = dynamic(() => import("./vcard-qr-workspace"));
const Reader = dynamic(() => import("./qr-code-reader-workspace"));
const Compare = dynamic(() => import("./vcf-compare-workspace"));
const Compatibility = dynamic(() => import("./vcf-compatibility-workspace"));
const Pdf = dynamic(() => import("./pdf-workspace"));
const Sqlite = dynamic(() => import("./sqlite-workspace"));
const Photo = dynamic(() => import("./photo-workspace"));
const Fuzzy = dynamic(() => import("./fuzzy-workspace"));

export default function ToolWorkspace({ workspace }: { workspace: Workspace }) {
  switch (workspace.kind) {
    case "editor":
      return <Editor />;
    case "viewer":
      return <Viewer table={workspace.table} />;
    case "creator":
      return <Creator />;
    case "contact":
      return <ContactTools mode={workspace.mode} />;
    case "conversion":
      return <Conversion mode={workspace.mode} allowPaste={workspace.paste} />;
    case "standards":
      return <Standards mode={workspace.mode} />;
    case "text":
      return <TextTools mode={workspace.mode} />;
    case "transform":
      return <Transform mode={workspace.mode} />;
    case "qr":
      return <Qr mode={workspace.mode} />;
    case "reader":
      return <Reader camera={workspace.camera} />;
    case "compare":
      return <Compare />;
    case "compatibility":
      return <Compatibility />;
    case "pdf":
      return <Pdf />;
    case "sqlite":
      return <Sqlite direction={workspace.mode} />;
    case "photo":
      return <Photo mode={workspace.mode} />;
    case "fuzzy":
      return <Fuzzy />;
  }
}
