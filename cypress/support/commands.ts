/// <reference types="cypress" />

const SIGN_IN_ROOT = '[data-clerk-component="SignIn"]';
const CONTINUE_BUTTON = '.cl-formButtonPrimary';
const CLERK_TEST_CODE = '424242';

Cypress.Commands.add('signIn', () => {
	const email = Cypress.env('CLERK_TEST_EMAIL') as string;
	const password = Cypress.env('CYPRESS_CLERK_TEST_PASSWORD') as string;

	if (!email || !password) {
		throw new Error('Missing CLERK_TEST_EMAIL or CYPRESS_CLERK_TEST_PASSWORD');
	}

	cy.visit('/sign-in');
	cy.clerkLoaded();
	cy.get('input[name="identifier"]').type(email);
	cy.get(CONTINUE_BUTTON).contains('Continue').click();
	cy.get('input[name="password"]').type(password);
	cy.get(SIGN_IN_ROOT).find(CONTINUE_BUTTON).click();
	cy.url({ timeout: 30000 }).should('match', /\/notes|client-trust/);
	cy.url().then(url => {
		if (url.includes('client-trust')) {
			cy.get('input[inputmode="numeric"]', { timeout: 10000 })
				.first()
				.type(`${CLERK_TEST_CODE}{enter}`);
		}
	});
	cy.url({ timeout: 30000 }).should('include', '/notes');
	cy.get('[data-testid="avatar"]').should('exist');
});

declare global {
	namespace Cypress {
		interface Chainable {
			signIn(): Chainable<void>;
		}
	}
}

export {};
