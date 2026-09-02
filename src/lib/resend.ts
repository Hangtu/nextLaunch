import { Resend } from "resend";

import { serverEnv } from "@/lib/env";

if (!serverEnv.RESEND_API_KEY) {
  throw new Error(
    "Resend is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL in " +
      ".env.local, or remove email sending from this project (src/lib/resend.ts, " +
      "src/lib/email/, the RESEND_* env vars, and the `resend` package) if " +
      "it doesn't need transactional email — see docs/integrations.md."
  );
}

export const resend = new Resend(serverEnv.RESEND_API_KEY);
