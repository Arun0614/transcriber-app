import { randomUUID } from "node:crypto";
import pg from "pg";
import { hashPassword } from "better-auth/crypto";
import { loadEnv } from "./load-env.mjs";

loadEnv();

const ADMIN_USERNAME = "admin";
const ADMIN_EMAIL = "admin@voicescript.app";
const ADMIN_PASSWORD = "Admin@2024!";
const ADMIN_NAME = "Admin";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Add it to your environment or .env.local.");
}

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL?.includes("railway") || process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

async function seed() {
  const client = await pool.connect();

  try {
    console.log("Seeding admin user...");

    const passwordHash = await hashPassword(ADMIN_PASSWORD);
    const now = new Date();

    await client.query("BEGIN");

    const existingUserResult = await client.query(
      `
        SELECT id
        FROM "user"
        WHERE username = $1 OR email = $2
        LIMIT 1
      `,
      [ADMIN_USERNAME, ADMIN_EMAIL]
    );

    const userId = existingUserResult.rows[0]?.id ?? randomUUID();

    if (existingUserResult.rows[0]?.id) {
      await client.query(
        `
          UPDATE "user"
          SET
            name = $2,
            email = $3,
            email_verified = true,
            username = $4,
            display_username = $5,
            updated_at = $6
          WHERE id = $1
        `,
        [userId, ADMIN_NAME, ADMIN_EMAIL, ADMIN_USERNAME, ADMIN_USERNAME, now]
      );
    } else {
      await client.query(
        `
          INSERT INTO "user" (
            id,
            name,
            email,
            email_verified,
            username,
            display_username,
            created_at,
            updated_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `,
        [userId, ADMIN_NAME, ADMIN_EMAIL, true, ADMIN_USERNAME, ADMIN_USERNAME, now, now]
      );
    }

    const existingAccountResult = await client.query(
      `
        SELECT id
        FROM account
        WHERE user_id = $1 AND provider_id = 'credential'
        LIMIT 1
      `,
      [userId]
    );

    if (existingAccountResult.rows[0]?.id) {
      await client.query(
        `
          UPDATE account
          SET
            account_id = $2,
            password = $3,
            updated_at = $4
          WHERE id = $1
        `,
        [existingAccountResult.rows[0].id, userId, passwordHash, now]
      );
    } else {
      await client.query(
        `
          INSERT INTO account (
            id,
            account_id,
            provider_id,
            user_id,
            password,
            created_at,
            updated_at
          )
          VALUES ($1, $2, 'credential', $3, $4, $5, $6)
        `,
        [randomUUID(), userId, userId, passwordHash, now, now]
      );
    }

    await client.query("COMMIT");

    console.log("✓ Admin credentials are ready");
    console.log(`  Username: ${ADMIN_USERNAME}`);
    console.log(`  Password: ${ADMIN_PASSWORD}`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Seed error:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});


