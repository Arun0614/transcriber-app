// Database migration script - creates all required tables
// Run locally: node scripts/migrate.mjs
// Run on Railway: node scripts/migrate.mjs

import pg from "pg";
import { loadEnv } from "./load-env.mjs";

loadEnv();

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Add it to your environment or .env.local.");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL?.includes("railway") || process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

async function migrate() {
  const client = await pool.connect();

  try {
    console.log("Running migrations...");

    await client.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'user' AND column_name = 'emailVerified'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'user' AND column_name = 'email_verified'
        ) THEN
          ALTER TABLE "user" RENAME COLUMN "emailVerified" TO email_verified;
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'user' AND column_name = 'displayUsername'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'user' AND column_name = 'display_username'
        ) THEN
          ALTER TABLE "user" RENAME COLUMN "displayUsername" TO display_username;
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'user' AND column_name = 'createdAt'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'user' AND column_name = 'created_at'
        ) THEN
          ALTER TABLE "user" RENAME COLUMN "createdAt" TO created_at;
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'user' AND column_name = 'updatedAt'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'user' AND column_name = 'updated_at'
        ) THEN
          ALTER TABLE "user" RENAME COLUMN "updatedAt" TO updated_at;
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'session' AND column_name = 'expiresAt'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'session' AND column_name = 'expires_at'
        ) THEN
          ALTER TABLE session RENAME COLUMN "expiresAt" TO expires_at;
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'session' AND column_name = 'createdAt'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'session' AND column_name = 'created_at'
        ) THEN
          ALTER TABLE session RENAME COLUMN "createdAt" TO created_at;
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'session' AND column_name = 'updatedAt'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'session' AND column_name = 'updated_at'
        ) THEN
          ALTER TABLE session RENAME COLUMN "updatedAt" TO updated_at;
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'session' AND column_name = 'ipAddress'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'session' AND column_name = 'ip_address'
        ) THEN
          ALTER TABLE session RENAME COLUMN "ipAddress" TO ip_address;
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'session' AND column_name = 'userAgent'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'session' AND column_name = 'user_agent'
        ) THEN
          ALTER TABLE session RENAME COLUMN "userAgent" TO user_agent;
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'session' AND column_name = 'userId'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'session' AND column_name = 'user_id'
        ) THEN
          ALTER TABLE session RENAME COLUMN "userId" TO user_id;
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'account' AND column_name = 'accountId'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'account' AND column_name = 'account_id'
        ) THEN
          ALTER TABLE account RENAME COLUMN "accountId" TO account_id;
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'account' AND column_name = 'providerId'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'account' AND column_name = 'provider_id'
        ) THEN
          ALTER TABLE account RENAME COLUMN "providerId" TO provider_id;
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'account' AND column_name = 'userId'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'account' AND column_name = 'user_id'
        ) THEN
          ALTER TABLE account RENAME COLUMN "userId" TO user_id;
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'account' AND column_name = 'accessToken'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'account' AND column_name = 'access_token'
        ) THEN
          ALTER TABLE account RENAME COLUMN "accessToken" TO access_token;
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'account' AND column_name = 'refreshToken'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'account' AND column_name = 'refresh_token'
        ) THEN
          ALTER TABLE account RENAME COLUMN "refreshToken" TO refresh_token;
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'account' AND column_name = 'idToken'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'account' AND column_name = 'id_token'
        ) THEN
          ALTER TABLE account RENAME COLUMN "idToken" TO id_token;
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'account' AND column_name = 'accessTokenExpiresAt'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'account' AND column_name = 'access_token_expires_at'
        ) THEN
          ALTER TABLE account RENAME COLUMN "accessTokenExpiresAt" TO access_token_expires_at;
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'account' AND column_name = 'refreshTokenExpiresAt'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'account' AND column_name = 'refresh_token_expires_at'
        ) THEN
          ALTER TABLE account RENAME COLUMN "refreshTokenExpiresAt" TO refresh_token_expires_at;
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'account' AND column_name = 'createdAt'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'account' AND column_name = 'created_at'
        ) THEN
          ALTER TABLE account RENAME COLUMN "createdAt" TO created_at;
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'account' AND column_name = 'updatedAt'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'account' AND column_name = 'updated_at'
        ) THEN
          ALTER TABLE account RENAME COLUMN "updatedAt" TO updated_at;
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'verification' AND column_name = 'expiresAt'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'verification' AND column_name = 'expires_at'
        ) THEN
          ALTER TABLE verification RENAME COLUMN "expiresAt" TO expires_at;
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'verification' AND column_name = 'createdAt'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'verification' AND column_name = 'created_at'
        ) THEN
          ALTER TABLE verification RENAME COLUMN "createdAt" TO created_at;
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'verification' AND column_name = 'updatedAt'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'verification' AND column_name = 'updated_at'
        ) THEN
          ALTER TABLE verification RENAME COLUMN "updatedAt" TO updated_at;
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'transcripts' AND column_name = 'userId'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'transcripts' AND column_name = 'user_id'
        ) THEN
          ALTER TABLE transcripts RENAME COLUMN "userId" TO user_id;
        END IF;

        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'transcripts' AND column_name = 'createdAt'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'transcripts' AND column_name = 'created_at'
        ) THEN
          ALTER TABLE transcripts RENAME COLUMN "createdAt" TO created_at;
        END IF;
      END $$;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS "user" (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        email_verified BOOLEAN NOT NULL DEFAULT false,
        image TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        username TEXT UNIQUE,
        display_username TEXT
      );
    `);

    await client.query(`
      ALTER TABLE "user"
      ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS username TEXT,
      ADD COLUMN IF NOT EXISTS display_username TEXT;
    `);

    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'user_username_unique'
        ) THEN
          ALTER TABLE "user" ADD CONSTRAINT user_username_unique UNIQUE (username);
        END IF;

        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'user_email_unique'
        ) THEN
          ALTER TABLE "user" ADD CONSTRAINT user_email_unique UNIQUE (email);
        END IF;
      END $$;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS session (
        id TEXT PRIMARY KEY,
        expires_at TIMESTAMP NOT NULL,
        token TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        ip_address TEXT,
        user_agent TEXT,
        user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
      );
    `);

    await client.query(`
      ALTER TABLE session
      ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP NOT NULL DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS ip_address TEXT,
      ADD COLUMN IF NOT EXISTS user_agent TEXT,
      ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS account (
        id TEXT PRIMARY KEY,
        account_id TEXT NOT NULL,
        provider_id TEXT NOT NULL,
        user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        access_token TEXT,
        refresh_token TEXT,
        id_token TEXT,
        access_token_expires_at TIMESTAMP,
        refresh_token_expires_at TIMESTAMP,
        scope TEXT,
        password TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      ALTER TABLE account
      ADD COLUMN IF NOT EXISTS account_id TEXT,
      ADD COLUMN IF NOT EXISTS provider_id TEXT,
      ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS access_token TEXT,
      ADD COLUMN IF NOT EXISTS refresh_token TEXT,
      ADD COLUMN IF NOT EXISTS id_token TEXT,
      ADD COLUMN IF NOT EXISTS access_token_expires_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS refresh_token_expires_at TIMESTAMP,
      ADD COLUMN IF NOT EXISTS scope TEXT,
      ADD COLUMN IF NOT EXISTS password TEXT,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS verification (
        id TEXT PRIMARY KEY,
        identifier TEXT NOT NULL,
        value TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      ALTER TABLE verification
      ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP NOT NULL DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS transcripts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        filename TEXT NOT NULL,
        transcript TEXT NOT NULL,
        duration TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      ALTER TABLE transcripts
      ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT NOW();
    `);

    console.log("✓ All tables created successfully");
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
