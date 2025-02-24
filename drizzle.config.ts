import { type Config } from "drizzle-kit";

import { env } from "./env";

export default {
  schema: "@/lib/db/schema.prisma",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  tablesFilter: ["start-bundle_*"],
} satisfies Config;
