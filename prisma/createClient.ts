import 'dotenv/config';
import { PrismaClient } from './generated/prisma-client-js/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

/**
 * Creates a PrismaClient instance with PostgreSQL adapter.
 * Use this helper for standalone scripts that need their own client instance.
 */
export function createPrismaClient(): PrismaClient {
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) {
		throw new Error('DATABASE_URL environment variable is not set');
	}

	const pool = new Pool({ connectionString });
	const adapter = new PrismaPg(pool);
	return new PrismaClient({ adapter });
}
