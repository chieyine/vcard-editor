import { InfoPage } from "../../components/site-chrome";

export const metadata = { title: "Contact — vCard Editor", description: "Contact the vCard Editor project.", alternates: { canonical: "/contact" } };

export default function ContactPage() {
  return <InfoPage eyebrow="CONTACT" title="Tell us what happened." intro="The most useful feedback includes the job you were trying to complete, the browser you used, and a small synthetic example of the file shape."><h2>Bug reports</h2><p>Describe what you expected, what happened, and whether the issue affects opening, editing, validation, or downloading.</p><h2>Privacy reminder</h2><p>Do not attach real contact files or paste personal phone numbers and email addresses into a report. Replace them with fictional values first.</p></InfoPage>;
}
