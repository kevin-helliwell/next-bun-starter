import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

// Do not let .env files override DATABASE_URL already set by the shell (e.g. CI).
config({ override: false });

export default defineConfig({
	schema: 'prisma/schema.prisma',
	migrations: {
		path: 'prisma/migrations',
		seed: 'tsx prisma/seed.ts',
	},
	datasource: {
		// Use a dummy value for commands that don't need a real connection (e.g., prisma format)
		url: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/db',
	},
});
