"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

const emptySubscribe = () => () => {};

/**
 * True only once the client has hydrated. `useSyncExternalStore` (rather
 * than a `useEffect` + `setState`) avoids both the hydration mismatch and
 * the "setState in an effect" lint warning that pattern trips.
 */
function useHasMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

/**
 * Light/dark toggle. Renders a disabled placeholder until mounted —
 * `next-themes` doesn't know the resolved theme on the server, and
 * guessing would cause a hydration mismatch.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useHasMounted();

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      disabled={!mounted}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {mounted && resolvedTheme === "dark" ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  );
}
