import { Loader2 } from "lucide-react";

/**
 * Shown by React Suspense while a route segment's data is loading.
 * Replace with a skeleton matching the final content's dimensions once a
 * route is slow enough to need one — a spinner is fine for now.
 */
export default function Loading() {
  return (
    <div
      role="status"
      aria-busy="true"
      className="flex min-h-[50vh] items-center justify-center"
    >
      <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
