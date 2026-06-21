import { defineConfig } from 'cypress';
import { clerkSetup } from '@clerk/testing/cypress';
import { ensureClerkTestUser } from './cypress/support/ensure-clerk-test-user';

export default defineConfig({
	e2e: {
		baseUrl: 'http://localhost:3000/',
		defaultCommandTimeout: 30000,
		retries: 2,
		env: {
			CLERK_TEST_EMAIL: '',
			CYPRESS_CLERK_TEST_PASSWORD: '',
		},
		async setupNodeEvents(_on, config) {
			const updatedConfig = await clerkSetup({ config });
			await ensureClerkTestUser(updatedConfig);
			return updatedConfig;
		},
	},
});
