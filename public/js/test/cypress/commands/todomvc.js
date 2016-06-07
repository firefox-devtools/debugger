function addTodo() {
  cy.debuggee(() => {
    window.Debuggee.type("#new-todo", "hi");
    window.Debuggee.type("#new-todo", "{enter}");
  });
}

function editTodo() {
  cy.debuggee(() => {
    window.Debuggee.dblclick("#todo-list li label");
    window.Debuggee.type("#todo-list li .edit", "there");
    window.Debuggee.type("#todo-list li .edit", "{enter}");
  });
}

function toggleTodo() {
  cy.debuggee(() => {
    window.Debuggee.click("#todo-list li .toggle");
  });
}

Object.assign(window, {
  addTodo,
  editTodo,
  toggleTodo
})
