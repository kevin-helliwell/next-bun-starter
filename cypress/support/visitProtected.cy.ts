export default function visitProtected(URL = '/') {
	cy.visit(URL, { failOnStatusCode: false });
	cy.origin(Cypress.env('CLERK_HOST'), () => {
		cy.get('#identifier-field')
			.should('exist', 'be.visible')
			.type(Cypress.env('CLERK_TEST_EMAIL') + '{enter}');

		cy.get('#password-field').click();
		cy.get('#password-field').type(Cypress.env('CYPRESS_CLERK_TEST_PASSWORD'));
		cy.get('.cl-formButtonPrimary').click();

		cy.document().then(doc => {
			const el = Cypress.$('[aria-label="Enter verification code.  Digit 1"]', doc);
			if (el.length) {
				cy.wrap(el).type('424242{enter}');
			} else {
				cy.log('no 2fa requested');
			}
		});
	});
}
