import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { iniDatabaseUrl } from "../src/database/database-urls.js";
import { hashPassword } from "../src/utilities/password-helper.js";

const email = process.env.PLAY_REVIEW_EMAIL?.trim().toLowerCase();
const password = process.env.PLAY_REVIEW_PASSWORD;

if (!email || !password || password.length < 12) {
  throw new Error("PLAY_REVIEW_EMAIL and a 12+ character PLAY_REVIEW_PASSWORD are required.");
}

const db = new PrismaClient({ datasources: { db: { url: iniDatabaseUrl } } });

try {
  const passwordHash = await hashPassword(password);
  const existing = await db.$queryRaw`
    SELECT user_id FROM users WHERE user_account = ${email} OR email = ${email} LIMIT 1
  `;
  let userId;
  if (existing.length) {
    userId = Number(existing[0].user_id);
    await db.$executeRaw`
      UPDATE users SET password_hash = ${passwordHash}, is_banned = FALSE,
        is_test_account = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
    `;
  } else {
    await db.$executeRaw`
      INSERT INTO users
        (user_account, password_hash, email, phone, created_at, updated_at,
         is_banned, is_test_account)
      VALUES
        (${email}, ${passwordHash}, ${email}, NULL,
         CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, FALSE, FALSE)
    `;
    const ids = await db.$queryRaw`SELECT LAST_INSERT_ID() AS user_id`;
    userId = Number(ids[0].user_id);
  }

  await db.$executeRaw`
    INSERT INTO user_profiles
      (user_id, display_name, birthdate, gender, avatar_id, city, headline, bio,
       profile_initialized, created_at, updated_at)
    VALUES
      (${userId}, 'Google Play Reviewer', '1996-01-01', 'female', 'female_cat_01',
       '臺北市', 'Google Play 審查帳號', '此帳號僅供 Google Play 審查使用。',
       TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON DUPLICATE KEY UPDATE
      display_name = VALUES(display_name), birthdate = VALUES(birthdate),
      gender = VALUES(gender), avatar_id = VALUES(avatar_id), city = VALUES(city),
      headline = VALUES(headline), bio = VALUES(bio), profile_initialized = TRUE,
      updated_at = CURRENT_TIMESTAMP
  `;
  console.log(`Google Play review account is ready: ${email} (user ${userId})`);
} finally {
  await db.$disconnect();
}
