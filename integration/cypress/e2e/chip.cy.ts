function acceptCookies() {
  cy.get("#trackingBanner").then((banner) => {
    banner.find(".accept")[0].click();
  });
}

describe("template spec", () => {
  beforeEach(() => {
    cy.visit("/web-ide/chip/");
    acceptCookies();
  });

  it("evals pin", () => {
    cy.get('[data-testid="project-picker"]').should(
      "contain.text",
      "Project 1"
    );
    cy.get('[data-testid="chip-picker"]').should("contain.text", "Not");

    cy.get('[data-testid="pin-0"]')
      .first()
      .should("contain.text", "0")
      .click()
      .should("contain.text", "1");
  });
});
