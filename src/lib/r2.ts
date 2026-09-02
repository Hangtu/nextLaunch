import { S3Client } from "@aws-sdk/client-s3";

import { serverEnv } from "@/lib/env";

if (
  !serverEnv.R2_ACCOUNT_ID ||
  !serverEnv.R2_ACCESS_KEY_ID ||
  !serverEnv.R2_SECRET_ACCESS_KEY ||
  !serverEnv.R2_BUCKET_NAME
) {
  throw new Error(
    "Cloudflare R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, " +
      "R2_SECRET_ACCESS_KEY and R2_BUCKET_NAME in .env.local, or remove R2 " +
      "from this project (src/lib/r2.ts, the R2_* env vars, and the " +
      "`@aws-sdk/client-s3` package) if it doesn't need file storage — see " +
      "docs/integrations.md."
  );
}

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${serverEnv.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: serverEnv.R2_ACCESS_KEY_ID,
    secretAccessKey: serverEnv.R2_SECRET_ACCESS_KEY,
  },
});

export const R2_BUCKET_NAME = serverEnv.R2_BUCKET_NAME;
