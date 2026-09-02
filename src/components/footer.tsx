import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { APP_CONFIG } from "@/lib/constants";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="text-muted-foreground border-t py-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 text-sm sm:flex-row">
        <p>
          © {new Date().getFullYear()} {APP_CONFIG.name}
        </p>
        <nav className="flex gap-4">
          <Link
            href="/privacy"
            className="hover:text-foreground underline-offset-4 hover:underline"
          >
            {t("privacy")}
          </Link>
          <Link
            href="/terms"
            className="hover:text-foreground underline-offset-4 hover:underline"
          >
            {t("terms")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
