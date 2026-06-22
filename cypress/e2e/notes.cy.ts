import { setupClerkTestingToken } from '@clerk/testing/cypress';

const noteTitle = `E2E note ${Date.now()}`;
const updatedTitle = `${noteTitle} updated`;

beforeEach(() => {
	setupClerkTestingToken();
});

describe('notes CRUD', () => {
	it('creates, edits, and deletes a note', function () {
		if (!Cypress.env('CLERK_TEST_EMAIL') || !Cypress.env('CYPRESS_CLERK_TEST_PASSWORD')) {
			this.skip();
		}

		cy.signIn();
		cy.get('[data-testid="new-note-link"]').click();
		cy.url().should('include', '/notes/new');
		cy.get('[data-testid="note-title-input"]').type(noteTitle);
		cy.get('[data-testid="note-content-input"]').type('Created by Cypress');
		cy.get('[data-testid="note-submit-button"]').click();
		cy.url({ timeout: 15000 }).should('match', /\/notes$/);
		cy.get('[data-testid="notes-list"]').should('contain', noteTitle);

		cy.contains('[data-testid="note-card"]', noteTitle).within(() => {
			cy.contains('a', 'Edit').click();
		});
		cy.url().should('include', '/edit');
		cy.get('[data-testid="note-title-input"]').clear();
		cy.get('[data-testid="note-title-input"]').type(updatedTitle);
		cy.get('[data-testid="note-submit-button"]').click();
		cy.url({ timeout: 15000 }).should('match', /\/notes$/);
		cy.get('[data-testid="notes-list"]').should('contain', updatedTitle);

		cy.window().then(win => {
			cy.stub(win, 'confirm').returns(true);
		});
		cy.contains('[data-testid="note-card"]', updatedTitle).within(() => {
			cy.get('[data-testid="note-delete-button"]').click();
		});
		cy.contains('[data-testid="note-card"]', updatedTitle).should('not.exist');
	});
});

describe('notes access', () => {
	it('redirects unauthenticated users to sign in', () => {
		cy.visit('/notes');
		cy.url({ timeout: 15000 }).should('include', '/sign-in');
	});
});
