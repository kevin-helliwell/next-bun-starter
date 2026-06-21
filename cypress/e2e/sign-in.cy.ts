import { setupClerkTestingToken, addClerkCommands } from '@clerk/testing/cypress';

addClerkCommands({ Cypress, cy });

const SIGN_IN_ROOT = '[data-clerk-component="SignIn"]';
const IDENTIFIER_INPUT = 'input[name="identifier"]';
const CONTINUE_BUTTON = '.cl-formButtonPrimary';
const MODAL_CLOSE = 'button[aria-label*="Close"], [data-clerk-element="modalCloseButton"]';
const FORM_ERROR = '[data-testid="form-feedback-error"], .cl-formFieldErrorText';

const email = Cypress.env('CLERK_TEST_EMAIL') as string;
const password = Cypress.env('CYPRESS_CLERK_TEST_PASSWORD') as string;

function openSignInModal(): void {
	cy.contains('button', 'Sign In').click({ force: true });
	cy.get(SIGN_IN_ROOT, { timeout: 30000 }).should('be.visible');
}

beforeEach(() => {
	cy.viewport(1280, 720);
	setupClerkTestingToken();
	cy.visit('/', { failOnStatusCode: false });
	cy.clerkLoaded();
});

describe('sign in path', () => {
	it('check if sign in button exists', () => {
		cy.contains('button', 'Sign In').should('exist');
	});

	it('clicking the sign in button opens modal', () => {
		openSignInModal();
	});

	it('clicking X closes modal', () => {
		openSignInModal();
		cy.get(MODAL_CLOSE).first().click({ force: true });
		cy.get(SIGN_IN_ROOT).should('not.exist');
	});

	it('sign in with wrong username error', () => {
		openSignInModal();
		cy.get(IDENTIFIER_INPUT).type('username');
		cy.get(CONTINUE_BUTTON).contains('button', 'Continue').click();
		cy.get(FORM_ERROR).should('contain', "Couldn't find your account.");
	});

	it('sign in with correct email and password', function () {
		if (!email || !password) {
			this.skip();
		}

		cy.clerkSignIn({ strategy: 'password', identifier: email, password });
		cy.get('[data-clerk-component="UserButton"]').should('exist');
	});
});
