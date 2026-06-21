import { defineConfig } from 'cypress';
import { clerkSetup } from '@clerk/testing/cypress';

export default defineConfig({
	e2e: {
		baseUrl: 'http://localhost:3000/',
		defaultCommandTimeout: 30000,
		retries: 2,
		env: {
			CLERK_TEST_EMAIL: '',
			CLERK_HOST: '',
			CLERK_APP_NAME: 'My App',
			CYPRESS_CLERK_TEST_PASSWORD: '',
		},
		setupNodeEvents(_on, config) {
			return clerkSetup({ config });
		},
	},
});
