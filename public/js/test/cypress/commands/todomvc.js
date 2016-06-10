function addTodo() {
  cy.debuggee(() => {
    dbg.type("#new-todo", "hi");
    dbg.type("#new-todo", "{enter}");
  });
}

function editTodo() {
  cy.debuggee(() => {
    dbg.dblclick("#todo-list li label");
    dbg.type("#todo-list li .edit", "there");
    dbg.type("#todo-list li .edit", "{enter}");
  });
}

function toggleTodo() {
  cy.debuggee(() => {
    dbg.click("#todo-list li .toggle");
  });
}

Object.assign(window, {
  addTodo,
  editTodo,
  toggleTodo
});
