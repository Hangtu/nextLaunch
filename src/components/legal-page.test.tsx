import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

import { LegalPage } from "@/components/legal-page";

const messages = {
  legal: {
    todoNotice: "This is placeholder content, not legal advice.",
    effectiveDate: "Effective date: [fill in]",
    privacy: {
      title: "Privacy Policy",
      sections: [{ heading: "Who we are", body: "We are a company." }],
    },
    terms: {
      title: "Terms of Service",
      sections: [{ heading: "Acceptance", body: "You agree to these terms." }],
    },
  },
};

function renderLegal(namespace: "privacy" | "terms") {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <LegalPage namespace={namespace} />
    </NextIntlClientProvider>
  );
}

describe("LegalPage", () => {
  it("renders the privacy document with the placeholder banner", () => {
    renderLegal("privacy");

    expect(
      screen.getByRole("heading", { name: "Privacy Policy", level: 1 })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Who we are", level: 2 })
    ).toBeInTheDocument();
    expect(screen.getByText("We are a company.")).toBeInTheDocument();
    expect(screen.getByText(/not legal advice/i)).toBeInTheDocument();
  });

  it("renders the terms document for the requested namespace", () => {
    renderLegal("terms");

    expect(
      screen.getByRole("heading", { name: "Terms of Service", level: 1 })
    ).toBeInTheDocument();
    expect(screen.getByText("You agree to these terms.")).toBeInTheDocument();
  });
});
