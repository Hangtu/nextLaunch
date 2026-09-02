import Stripe from "stripe";

import { serverEnv } from "@/lib/env";

if (!serverEnv.STRIPE_SECRET_KEY) {
  throw new Error(
    "Stripe is not configured. Set STRIPE_SECRET_KEY in .env.local, or " +
      "remove Stripe from this project (src/lib/stripe.ts, " +
      "src/app/api/webhooks/stripe/, the STRIPE_* env vars, and the " +
      "`stripe`/`@stripe/stripe-js` packages) if it doesn't need payments — " +
      "see docs/integrations.md."
  );
}

export const stripe = new Stripe(serverEnv.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil",
  typescript: true,
});
