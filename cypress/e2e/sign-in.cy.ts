import { setupClerkTestingToken, addClerkCommands } from '@clerk/testing/cypress';

addClerkCommands({ Cypress, cy });

const SIGN_IN_ROOT = '[data-clerk-component="SignIn"]';
const IDENTIFIER_INPUT = 'input[name="identifier"]';
const PASSWORD_INPUT = 'input[name="password"]';
const CONTINUE_BUTTON = '.cl-formButtonPrimary';

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
		// Desktop nav Home (mobile menu Home is hidden in DOM at this viewport)
		cy.get('.navbar-center').find('a[href="/"]').click();
		cy.url().should('not.include', '/sign-in');
	});

	it('sign in with wrong username error', () => {
		openSignInPage();
		cy.get(IDENTIFIER_INPUT).type('nonexistent+clerk_test@example.com');
		cy.get(CONTINUE_BUTTON).contains('Continue').click();
		cy.get(SIGN_IN_ROOT).should('contain.text', "Couldn't find your account.");
	});

	it('sign in with correct email and password', function () {
		if (!email || !password) {
			this.skip();
		}

		openSignInPage();
		cy.get(IDENTIFIER_INPUT).type(email);
		cy.get(CONTINUE_BUTTON).contains('Continue').click();
		cy.get(PASSWORD_INPUT, { timeout: 10000 }).should('be.visible').type(password);
		cy.get(SIGN_IN_ROOT).find(CONTINUE_BUTTON).click();
		cy.get('[data-clerk-component="UserButton"]', { timeout: 30000 }).should('exist');
	});
});
