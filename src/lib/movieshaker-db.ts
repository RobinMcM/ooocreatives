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
