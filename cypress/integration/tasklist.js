/// <reference types="cypress" />

context("TaskList", () => {
  beforeEach(() => {
    cy.visit("http://localhost:1234");
  });

  it("undo", () => {
    // TODO take assertions from the fixtures

    cy.get("span[contenteditable]:eq(0)")
      .click()
      .type(" aaa");
    cy.get("span[contenteditable]:eq(1)")
      .click()
      .type(" bbb");
    cy.get("span[contenteditable]:eq(2)")
      .click()
      .type(" ccc")
      // trigger undo, 3 times
      .type("{meta}z")
      .type("{meta}z")
      .type("{meta}z");

    // assert
    cy.get("span[contenteditable]:eq(0)").should("have.text", "1 foo");
    cy.get("span[contenteditable]:eq(1)").should("have.text", "1-2 foo");
    cy.get("span[contenteditable]:eq(2)").should("have.text", "3 foo");
  });
});
