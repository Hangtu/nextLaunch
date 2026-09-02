import { useTranslations } from "next-intl";

interface LegalPageProps {
  /** Key under the `legal` namespace — `"privacy"` or `"terms"`. */
  namespace: "privacy" | "terms";
}

/**
 * Renders a legal document from `messages/{locale}.json`'s `legal.<namespace>`
 * section. See docs/integrations.md and AGENTS.md's "Not building" note —
 * the content itself is a placeholder, not legal advice.
 */
export function LegalPage({ namespace }: LegalPageProps) {
  const t = useTranslations("legal");
  const doc = t.raw(namespace) as {
    title: string;
    sections: { heading: string; body: string }[];
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="bg-muted text-muted-foreground mb-8 rounded-md border p-3 text-sm">
        ⚠️ {t("todoNotice")}
      </p>
      <h1 className="mb-2 text-3xl font-bold">{doc.title}</h1>
      <p className="text-muted-foreground mb-8 text-sm">{t("effectiveDate")}</p>
      <div className="space-y-6">
        {doc.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="mb-2 text-lg font-semibold">{section.heading}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
