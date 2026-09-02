import type { ReactNode } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

// next-intl's navigation Link resolves through `next/navigation`, which
// Vitest (Vite) can't load the way Next's own bundler does. Stub it with
// a plain anchor — all we're verifying here is the href/label, not
// client-side routing.
vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children }: { href: string; children?: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import { Footer } from "@/components/footer";

const messages = {
  footer: { privacy: "Privacidad", terms: "Términos" },
};

describe("Footer", () => {
  it("links to the privacy and terms pages", () => {
    render(
      <NextIntlClientProvider locale="es" messages={messages}>
        <Footer />
      </NextIntlClientProvider>
    );

    expect(screen.getByRole("link", { name: "Privacidad" })).toHaveAttribute(
      "href",
      "/privacy"
    );
    expect(screen.getByRole("link", { name: "Términos" })).toHaveAttribute(
      "href",
      "/terms"
    );
  });

  it("shows the current year in the copyright line", () => {
    render(
      <NextIntlClientProvider locale="es" messages={messages}>
        <Footer />
      </NextIntlClientProvider>
    );

    expect(
      screen.getByText(new RegExp(String(new Date().getFullYear())))
    ).toBeInTheDocument();
  });
});
