import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

import { LegalPage } from "@/components/legal-page";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.terms");
  return { title: t("title") };
}

export default function TermsPage() {
  return <LegalPage namespace="terms" />;
}
