import { setupClerkTestingToken } from '@clerk/testing/cypress';

beforeEach(() => {
	setupClerkTestingToken();
});

describe('sign in', () => {
	it('signs in and reaches notes', function () {
		if (!Cypress.env('CLERK_TEST_EMAIL') || !Cypress.env('CYPRESS_CLERK_TEST_PASSWORD')) {
			this.skip();
		}

		cy.signIn();
	});
});
