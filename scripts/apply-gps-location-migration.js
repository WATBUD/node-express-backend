import { PrismaClient } from "@prisma/client";
import { iniDatabaseUrl } from "../src/database/database-urls.js";

const prisma = new PrismaClient({
  datasources: { db: { url: iniDatabaseUrl } },
});

const count = async (table, field, source) => {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*) AS count FROM information_schema.${source} WHERE table_schema = DATABASE() AND table_name = ? AND ${field} = ?`,
    table.name,
    table.value,
  );
  return Number(rows[0].count);
};

try {
  if (
    !(await count(
      { name: "user_profiles", value: "location_accuracy_meters" },
      "column_name",
      "columns",
    ))
  ) {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE `user_profiles` ADD COLUMN `location_accuracy_meters` DECIMAL(8,2) NULL AFTER `longitude`",
    );
  }
  if (
    !(await count(
      { name: "user_profiles", value: "location_updated_at" },
      "column_name",
      "columns",
    ))
  ) {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE `user_profiles` ADD COLUMN `location_updated_at` DATETIME(3) NULL AFTER `location_accuracy_meters`",
    );
  }
  if (
    !(await count(
      { name: "user_profiles", value: "user_profiles_location_updated_at_idx" },
      "index_name",
      "statistics",
    ))
  ) {
    await prisma.$executeRawUnsafe(
      "CREATE INDEX `user_profiles_location_updated_at_idx` ON `user_profiles` (`location_updated_at`)",
    );
  }
  console.log(
    "GPS location migration is complete for the INI Dating database.",
  );
} finally {
  await prisma.$disconnect();
}
