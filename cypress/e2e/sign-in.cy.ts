import { setupClerkTestingToken, addClerkCommands } from '@clerk/testing/cypress';

addClerkCommands({ Cypress, cy });

const email = Cypress.env('CLERK_TEST_EMAIL');
const password = Cypress.env('CYPRESS_CLERK_TEST_PASSWORD');
const appName = Cypress.env('CLERK_APP_NAME') as string;
const signInTitle = `Sign in to ${appName}`;

beforeEach(() => {
	cy.viewport(1280, 720);
	setupClerkTestingToken();
	cy.visit('/', { failOnStatusCode: false });
});

describe('sign in path', () => {
	it('check if sign in button exists', () => {
		cy.contains('Sign In').should('exist');
	});

	it('clicking the sign in button opens modal', () => {
		cy.contains('Sign In').click({ force: true });
		cy.findByText(signInTitle).should('exist');
	});

	it('clicking X closes modal', () => {
		cy.contains('Sign In').click({ force: true });
		cy.findByText(signInTitle).should('exist');
		cy.findByLabelText('Close modal').click();
		cy.contains(signInTitle).should('not.exist');
	});

	it('sign in with wrong username error', () => {
		cy.contains('Sign In').click({ force: true });
		cy.findByPlaceholderText('Enter email or username').type('username');
		cy.get('.cl-formButtonPrimary').contains('button', 'Continue').click();
		cy.findByTestId('form-feedback-error').should('contain', "Couldn't find your account.");
	});

	it('sign in with correct email and password', function () {
		if (!email || !password) {
			this.skip();
		}

		cy.contains('Sign In').click({ force: true });
		cy.findByPlaceholderText('Enter email or username').type(email);
		cy.get('.cl-formButtonPrimary').contains('button', 'Continue').click();
		cy.findByPlaceholderText('Enter your password').should('be.visible');
		cy.findByPlaceholderText('Enter your password').type(password, { log: false });
		cy.get('.cl-formButtonPrimary').contains('button', 'Continue').click();
		cy.findByTestId('avatar');
	});
});
