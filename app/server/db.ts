import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './table';

let sqlClient: postgres.Sql | null = null;
let database: ReturnType<typeof createDatabase> | null = null;

function getConnectionString() {
  const connectionString = useRuntimeConfig().databaseUrl;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not set.');
  }

  return connectionString;
}

export function getSql() {
  sqlClient ??= postgres(getConnectionString(), {
    prepare: false,
  });

  return sqlClient;
}

function createDatabase() {
  return drizzle(getSql(), { schema, });
}

export function getDb() {
  database ??= createDatabase();

  return database;
}
