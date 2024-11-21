describe('template spec', () => {
  it('passes', () => {
    cy.visit('http://localhost:4200/');
    cy.get('button').click();
  });
});
