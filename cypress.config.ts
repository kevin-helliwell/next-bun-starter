import { defineConfig } from 'cypress';
import { clerkSetup } from '@clerk/testing/cypress';
import * as fs from 'fs';

export default defineConfig({
	e2e: {
		baseUrl: 'http://localhost:3000/',
		defaultCommandTimeout: 30000,
		retries: 2,
		excludeSpecPattern: ['**/spec.cy.ts'],
		env: {
			CLERK_TEST_EMAIL: '',
			CLERK_HOST: '',
			CLERK_APP_NAME: 'My App',
			CYPRESS_CLERK_TEST_PASSWORD: '',
		},
		setupNodeEvents(on, config) {
			on('task', {
				readFileIfExists(filePath: string): string | null {
					try {
						return fs.readFileSync(filePath, 'utf8');
					} catch {
						return null;
					}
				},
			});
			return clerkSetup({ config });
		},
	},

	component: {
		devServer: {
			framework: 'next',
			bundler: 'webpack',
		},
	},
});
