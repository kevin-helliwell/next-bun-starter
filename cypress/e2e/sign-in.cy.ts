import { setupClerkTestingToken, addClerkCommands } from '@clerk/testing/cypress';

addClerkCommands({ Cypress, cy });

const SIGN_IN_ROOT = '[data-clerk-component="SignIn"]';
const IDENTIFIER_INPUT = 'input[name="identifier"]';
const CONTINUE_BUTTON = '.cl-formButtonPrimary';
const FORM_ERROR = '[data-testid="form-feedback-error"], .cl-formFieldErrorText';

const email = Cypress.env('CLERK_TEST_EMAIL') as string;
const password = Cypress.env('CYPRESS_CLERK_TEST_PASSWORD') as string;

function openSignInPage(): void {
	cy.visit('/sign-in', { failOnStatusCode: false });
	cy.clerkLoaded();
	cy.get(SIGN_IN_ROOT, { timeout: 30000 }).should('be.visible');
}

beforeEach(() => {
	cy.viewport(1280, 720);
	setupClerkTestingToken();
});

describe('sign in path', () => {
	it('check if sign in button exists', () => {
		cy.visit('/', { failOnStatusCode: false });
		cy.clerkLoaded();
		cy.contains('button', 'Sign In').should('exist');
	});

	it('clicking Sign In navigates to the sign-in page', () => {
		cy.visit('/', { failOnStatusCode: false });
		cy.clerkLoaded();
		cy.contains('button', 'Sign In').click();
		cy.url().should('include', '/sign-in');
		cy.get(SIGN_IN_ROOT).should('be.visible');
	});

	it('can leave the sign-in page via Home', () => {
		openSignInPage();
		cy.contains('a', 'Home').click();
		cy.url().should('not.include', '/sign-in');
	});

	it('sign in with wrong username error', () => {
		openSignInPage();
		cy.get(IDENTIFIER_INPUT).type('username');
		cy.get(CONTINUE_BUTTON).contains('Continue').click();
		cy.get(FORM_ERROR).should('contain', "Couldn't find your account.");
	});

	it('sign in with correct email and password', function () {
		if (!email || !password) {
			this.skip();
		}

		cy.visit('/', { failOnStatusCode: false });
		cy.clerkLoaded();
		cy.clerkSignIn({ strategy: 'password', identifier: email, password });
		cy.get('[data-clerk-component="UserButton"]').should('exist');
	});
});
