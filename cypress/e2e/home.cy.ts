/// <reference path="../../node_modules/cypress/types/index.d.ts" />
import { setupClerkTestingToken } from '@clerk/testing/cypress';

beforeEach(() => {
	setupClerkTestingToken();
});

describe('home page elements', () => {
	it('checks home page elements', () => {
		cy.visit('/', { failOnStatusCode: false });

		cy.contains('My App').should('exist');
		cy.contains('Sign In').should('exist');
		cy.contains('Home').should('exist');
	});
});
