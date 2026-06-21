import 'dotenv/config';
import { PrismaClient } from './generated/prisma-client-js/client';
import { PrismaPg } from '@prisma/adapter-pg';

/**
 * Creates a PrismaClient instance with PostgreSQL adapter.
 * Use this helper for standalone scripts that need their own client instance.
 */
export function createPrismaClient(): PrismaClient {
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) {
		throw new Error('DATABASE_URL environment variable is not set');
	}

	const adapter = new PrismaPg({ connectionString });
	return new PrismaClient({ adapter });
}
