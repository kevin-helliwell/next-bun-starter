import { createClerkClient } from '@clerk/backend';

export async function ensureClerkTestUser(config: Cypress.PluginConfigOptions): Promise<void> {
	const email = config.env.CLERK_TEST_EMAIL as string | undefined;
	const password = config.env.CYPRESS_CLERK_TEST_PASSWORD as string | undefined;
	const secretKey = process.env.CLERK_SECRET_KEY;

	if (!email?.includes('+clerk_test') || !password || !secretKey) {
		return;
	}

	const clerk = createClerkClient({ secretKey });
	const { data } = await clerk.users.getUserList({ emailAddress: [email], limit: 1 });

	if (data.length > 0) {
		return;
	}

	await clerk.users.createUser({
		emailAddress: [email],
		password,
		skipPasswordChecks: true,
	});

	console.log(`Created Clerk E2E test user: ${email}`);
}
