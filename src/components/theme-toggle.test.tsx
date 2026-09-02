import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

function renderToggle() {
  return render(
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <ThemeToggle />
    </ThemeProvider>
  );
}

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.className = "";
  });

  it("renders an enabled, accessible toggle button", async () => {
    renderToggle();
    const button = await screen.findByRole("button", {
      name: /toggle theme/i,
    });
    expect(button).toBeEnabled();
  });

  it("switches the document to dark mode on click", async () => {
    renderToggle();
    const button = await screen.findByRole("button", {
      name: /toggle theme/i,
    });

    fireEvent.click(button);

    await waitFor(() =>
      expect(document.documentElement.classList.contains("dark")).toBe(true)
    );
  });

  it("switches back to light mode on a second click", async () => {
    renderToggle();
    const button = await screen.findByRole("button", {
      name: /toggle theme/i,
    });

    fireEvent.click(button); // light -> dark
    await waitFor(() =>
      expect(document.documentElement.classList.contains("dark")).toBe(true)
    );

    fireEvent.click(button); // dark -> light
    await waitFor(() =>
      expect(document.documentElement.classList.contains("light")).toBe(true)
    );
  });
});
