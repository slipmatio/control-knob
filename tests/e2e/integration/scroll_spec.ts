// https://docs.cypress.io/api/introduction/api.html

describe('Homepage', () => {
  it('does not scroll when using the mouse wheel', () => {
    // arrange (on a deliberately short viewport)
    cy.viewport(1024, 200)
    cy.visit('/')

    // act
    cy.get('#knob2').invoke('show').click()
    Cypress._.times(15, (k) => {
      cy.get('#knob2').trigger("wheel", { deltaY: -120, bubbles: true})
    })

    // assert
    cy.window().its('scrollY').should('equal', 0)
  })
})
