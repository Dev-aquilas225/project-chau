import { Client } from 'pg';

async function ensureDb() {
  const host = process.env.DB_HOST || 'postgres';
  const port = Number(process.env.DB_PORT || 5432);
  const targetUser = process.env.DB_USERNAME || 'postgres';
  const targetPass = process.env.DB_PASSWORD || 'postgres';
  const targetDb = process.env.DB_NAME || 'aquilas';

  // Try connecting directly with target user
  const testClient = new Client({
    host,
    port,
    user: targetUser,
    password: targetPass,
    database: targetDb,
    connectionTimeoutMillis: 5000,
  });

  try {
    await testClient.connect();
    await testClient.end();
    console.log(`[ensureDb] User "${targetUser}" connected successfully to database "${targetDb}".`);
    return;
  } catch (err: any) {
    console.log(`[ensureDb] Auth/connection for user "${targetUser}" failed (${err.message}). Setting up user/db via default admin...`);
  }

  // Fallback: connect as postgres superuser to setup role and database
  const adminPasswords = [targetPass, 'postgres', ''];
  let adminClient: Client | null = null;

  for (const pass of adminPasswords) {
    const c = new Client({
      host,
      port,
      user: 'postgres',
      password: pass,
      database: 'postgres',
      connectionTimeoutMillis: 3000,
    });
    try {
      await c.connect();
      adminClient = c;
      break;
    } catch {
      // try next
    }
  }

  if (!adminClient) {
    console.error('[ensureDb] Could not connect as "postgres" admin to fix user permissions.');
    return;
  }

  try {
    const resRole = await adminClient.query(`SELECT 1 FROM pg_roles WHERE rolname = $1`, [targetUser]);
    if (resRole.rowCount === 0) {
      await adminClient.query(`CREATE USER "${targetUser}" WITH PASSWORD '${targetPass}' SUPERUSER`);
      console.log(`[ensureDb] Created role "${targetUser}".`);
    } else {
      await adminClient.query(`ALTER USER "${targetUser}" WITH PASSWORD '${targetPass}' SUPERUSER`);
      console.log(`[ensureDb] Updated password for role "${targetUser}".`);
    }

    const resDb = await adminClient.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [targetDb]);
    if (resDb.rowCount === 0) {
      await adminClient.query(`CREATE DATABASE "${targetDb}" OWNER "${targetUser}"`);
      console.log(`[ensureDb] Created database "${targetDb}".`);
    }

    await adminClient.end();
  } catch (err: any) {
    console.error('[ensureDb] Error while creating role/database:', err.message);
  }
}

ensureDb();
