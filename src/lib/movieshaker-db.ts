import { Pool } from "pg";

const pool = new Pool({
  host: "movieshaker-supertokens-postgressql-do-user-25051567-0.k.db.ondigitalocean.com",
  port: 25060,
  database: "movieshaker",
  user: "doadmin",
  password: process.env.MOVIESHAKER_DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

function normalizeRoleValue(raw: string | null): string | null {
  if (!raw) return null;
  const lower = raw.toLowerCase().replace(/_/g, " ").trim();
  if (lower === "super user") return "Super User";
  if (lower === "admin") return "Admin";
  if (lower === "user") return "User";
  if (lower === "creative") return "Creative";
  return raw;
}

export async function getUserRole(userId: string): Promise<string | null> {
  const result = await pool.query(
    "SELECT role FROM user_profile WHERE user_id = $1",
    [userId]
  );
  return normalizeRoleValue(result.rows[0]?.role ?? null);
}

export async function upsertUserRole(userId: string, role: string): Promise<void> {
  await pool.query(
    `UPDATE user_profile SET role = $2 WHERE user_id = $1`,
    [userId, role]
  );
}

export interface UserProfile {
  userId: string;
  name: string | null;
  company: string | null;
  communicationEmail: string | null;
  username: string | null;
  phone: string | null;
  address: string | null;
  actorId: string | null;
  showAsCreative: boolean;
  initiated: string | null;
}

export interface OptedInCreative {
  userId: string;
  name: string | null;
  actorId: string | null;
}

let extraColumnsReady = false;

async function ensureExtraColumns(): Promise<void> {
  if (extraColumnsReady) return;
  await pool.query(`
    ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS actor_id VARCHAR(255);
    ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS show_as_creative BOOLEAN DEFAULT FALSE;
    ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS initiated VARCHAR(255);
  `);
  extraColumnsReady = true;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  await ensureExtraColumns();
  const result = await pool.query(
    `SELECT user_id, name, company, communication_email, username, phone, address, actor_id, show_as_creative, initiated
     FROM user_profile WHERE user_id = $1`,
    [userId]
  );
  if (!result.rows[0]) return null;
  const row = result.rows[0];
  return {
    userId: row.user_id,
    name: row.name ?? null,
    company: row.company ?? null,
    communicationEmail: row.communication_email ?? null,
    username: row.username ?? null,
    phone: row.phone ?? null,
    address: row.address ?? null,
    actorId: row.actor_id ?? null,
    showAsCreative: row.show_as_creative ?? false,
    initiated: row.initiated ?? null,
  };
}

export async function upsertUserProfile(
  userId: string,
  data: Omit<UserProfile, "userId" | "initiated">
): Promise<void> {
  await ensureExtraColumns();
  await pool.query(
    `UPDATE user_profile
     SET name = $2,
         company = $3,
         communication_email = $4,
         username = $5,
         phone = $6,
         address = $7,
         actor_id = $8,
         show_as_creative = $9,
         updated_at = NOW()
     WHERE user_id = $1`,
    [
      userId,
      data.name,
      data.company,
      data.communicationEmail,
      data.username,
      data.phone,
      data.address,
      data.actorId,
      data.showAsCreative,
    ]
  );
}

export async function setUserInitiated(userId: string, initiated: string): Promise<void> {
  await ensureExtraColumns();
  await pool.query(
    `UPDATE user_profile SET initiated = $2 WHERE user_id = $1 AND initiated IS NULL`,
    [userId, initiated]
  );
}

export interface InitiatedUser {
  userId: string;
  name: string | null;
  communicationEmail: string | null;
  username: string | null;
  company: string | null;
  initiated: string;
  role: string | null;
}

function normalizeRole(role: string | null): string | null {
  if (!role) return null;
  const lower = role.toLowerCase().replace(/_/g, " ");
  if (lower === "super user") return "Super User";
  if (lower === "admin") return "Admin";
  if (lower === "user") return "User";
  return role;
}

export async function getUsersByInitiated(initiated: string): Promise<InitiatedUser[]> {
  await ensureExtraColumns();
  const result = await pool.query(
    `SELECT user_id, name, communication_email, username, company, initiated, role
     FROM user_profile WHERE initiated = $1 ORDER BY name ASC NULLS LAST`,
    [initiated]
  );
  return result.rows.map((row) => ({
    userId: row.user_id,
    name: row.name ?? null,
    communicationEmail: row.communication_email ?? null,
    username: row.username ?? null,
    company: row.company ?? null,
    initiated: row.initiated,
    role: normalizeRole(row.role),
  }));
}

export async function getOptedInCreatives(): Promise<OptedInCreative[]> {
  await ensureExtraColumns();
  const result = await pool.query(
    `SELECT user_id, name, actor_id FROM user_profile WHERE show_as_creative = true`
  );
  return result.rows.map((row) => ({
    userId: row.user_id,
    name: row.name ?? null,
    actorId: row.actor_id ?? null,
  }));
}
