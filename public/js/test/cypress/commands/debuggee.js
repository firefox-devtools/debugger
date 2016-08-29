
function navigateBack() {
  cy.debuggee(() => {
    window.history.back();
  });
}

function navigateForward() {
  cy.debuggee(() => {
    window.history.forward();
  });
}

function reload() {
  cy.debuggee(() => {
    window.location.reload()
  });
}

Object.assign(window, {
  navigateForward,
  navigateBack,
  reload
})
