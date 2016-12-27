const { commands, utils, initDebugger } = require("./head.js");

require("mocha/mocha");

const { selectSource, addBreakpoint, removeBreakpoint, navigate, loadDebugger,
        stepIn, stepOut, stepOver, resume, prettyPrint } = commands;

const { waitForTime, waitForPaused, debuggee } = utils;

mocha.setup({ timeout: 20000, ui: 'bdd' });

function addTodo() {
  debuggee(() => {
    localStorage.clear();
    window.dbg.type("#new-todo", "hi");
    window.dbg.type("#new-todo", "{enter}");
  });

  return utils.waitForTime(1000);
}

describe("tests", function() {
  beforeEach(async function() {
    await waitForTime(2000);
    await loadDebugger();
  })

  it("debugger pausing", async function() {
    await navigate("http://localhost:7999/todomvc");

    await selectSource("todo-view");
    await addBreakpoint(33);
    await addBreakpoint(35);
    await addTodo();
    await stepIn();
    await stepOver();
    await stepOut();
    await resume();
    await waitForPaused();
    await resume();
    await removeBreakpoint(33);
    await removeBreakpoint(35);
  });

  it("pretty printing", async function() {
    await navigate("http://localhost:7999/todomvc");

    await selectSource("localStorage");
    await prettyPrint();
  });
});

mocha.run();
