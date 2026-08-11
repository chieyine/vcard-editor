import { InfoPage } from "../../components/site-chrome";

export const metadata = { title: "Security — vCard Editor", description: "Security principles for local-first vCard tools.", alternates: { canonical: "/security" } };

export default function SecurityPage() {
  return <InfoPage eyebrow="SECURITY" title="Private by architecture, careful by default." intro="The strongest protection is avoiding unnecessary transfer of sensitive contact data. The product is designed around local processing, narrow browser permissions, and explicit warnings."><h2>Security principles</h2><p>Local processing, no launch accounts, no server-side contact conversion, safe text rendering, bounded work for large files, and no contact values in logs.</p><h2>Responsible disclosure</h2><p>If you find a security issue, contact the project maintainer with the affected route, reproduction steps, and whether contact data was involved. Do not include real personal contact files in a report.</p><h2>Scope note</h2><p>This page describes the current product direction while the application is under active development. The security model will be updated as new processors and optional services are introduced.</p></InfoPage>;
}
