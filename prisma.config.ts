import 'dotenv/config';
import { defineConfig } from 'prisma/config';

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
