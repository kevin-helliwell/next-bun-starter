import 'dotenv/config';
import { PrismaClient } from './generated/prisma-client-js/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Create a global instance only for development environments, so that hot reloading re-uses a single instance
// SOURCE: https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#prevent-hot-reloading-from-creating-new-instances-of-prismaclient
// Prevents errors like
//    ```
//    Error querying the database: db error: FATAL: sorry, too many clients already
//    ```

const globalForPrisma = globalThis as unknown as {
	prisma?: PrismaClient;
	adapter?: PrismaPg;
	pool?: Pool;
};

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
	throw new Error('DATABASE_URL environment variable is not set');
}

// Create a single connection pool that can be reused
const pool =
	globalForPrisma.pool ??
	new Pool({
		connectionString,
	});

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.pool = pool;
}

// Create adapter instance
const adapter = globalForPrisma.adapter ?? new PrismaPg(pool);
if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.adapter = adapter;
}

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter,
		log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
	});

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = prisma;
}

export * from './generated/prisma-client-js/client';
