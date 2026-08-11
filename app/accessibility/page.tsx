import { InfoPage } from "../../components/site-chrome";

export const metadata = { title: "Accessibility — vCard Editor", description: "Accessibility commitments and keyboard guidance for vCard Editor.", alternates: { canonical: "/accessibility" } };

export default function AccessibilityPage() {
  return <InfoPage eyebrow="ACCESSIBILITY" title="Contact tools that work with you." intro="The target for core workflows is WCAG 2.2 AA. File drop areas always have a keyboard-accessible file chooser, and contact values are rendered as text rather than HTML."><h2>Keyboard support</h2><p>Use Tab to move through controls, Enter or Space to activate buttons, and the visible search and form fields to navigate contacts without dragging.</p><h2>Clear feedback</h2><p>Progress, warnings, validation results, and download status are announced through live regions. Colour is paired with labels and text so it is not the only signal.</p><h2>Report a barrier</h2><p>If a workflow is difficult to use with a keyboard, screen reader, zoom, or mobile browser, please describe the step and browser. Do not include real contact data.</p></InfoPage>;
}
