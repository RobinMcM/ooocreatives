import { Pool } from "pg";

const pool = new Pool({
  host: "movieshaker-supertokens-postgressql-do-user-25051567-0.k.db.ondigitalocean.com",
  port: 25060,
  database: "movieshaker",
  user: "doadmin",
  password: process.env.MOVIESHAKER_DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
});

export async function getUserRole(userId: string): Promise<string | null> {
  const result = await pool.query(
    "SELECT role FROM user_profile WHERE user_id = $1",
    [userId]
  );
  return result.rows[0]?.role ?? null;
}

export async function upsertUserRole(userId: string, role: string): Promise<void> {
  await pool.query(
    `INSERT INTO user_profile (user_id, role)
     VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role`,
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
}

let actorIdColumnReady = false;

async function ensureActorIdColumn(): Promise<void> {
  if (actorIdColumnReady) return;
  await pool.query(
    `ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS actor_id VARCHAR(255)`
  );
  actorIdColumnReady = true;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  await ensureActorIdColumn();
  const result = await pool.query(
    `SELECT user_id, name, company, communication_email, username, phone, address, actor_id
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
  };
}

export async function upsertUserProfile(
  userId: string,
  data: Omit<UserProfile, "userId">
): Promise<void> {
  await ensureActorIdColumn();
  await pool.query(
    `INSERT INTO user_profile (user_id, name, company, communication_email, username, phone, address, actor_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (user_id) DO UPDATE SET
       name = EXCLUDED.name,
       company = EXCLUDED.company,
       communication_email = EXCLUDED.communication_email,
       username = EXCLUDED.username,
       phone = EXCLUDED.phone,
       address = EXCLUDED.address,
       actor_id = EXCLUDED.actor_id,
       updated_at = NOW()`,
    [
      userId,
      data.name,
      data.company,
      data.communicationEmail,
      data.username,
      data.phone,
      data.address,
      data.actorId,
    ]
  );
}
