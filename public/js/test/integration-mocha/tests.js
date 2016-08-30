const { commands, utils, initDebugger } = require("./head.js");

const { selectSource, addBreakpoint, removeBreakpoint, navigate, loadDebugger,
        stepIn, stepOut, stepOver, resume, prettyPrint } = commands;

const { waitForTime, waitForPaused, debuggee } = utils;

function addTodo() {
  debuggee(() => {
    localStorage.clear();
    window.dbg.type("#new-todo", "hi");
    window.dbg.type("#new-todo", "{enter}");
  });

  return utils.waitForTime(1000);
}

describe("tests", function() {
  it("debugger pausing", async function(done) {
    await waitForTime(2000);
    await loadDebugger();
    await navigate("todomvc");
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
    expect(2).to.equal(2);
    done();
  });

  it("pretty printing", async function(done) {
    await waitForTime(2000);
    await loadDebugger();

    await navigate("todomvc");
    await selectSource("localStorage");
    await prettyPrint();
    done();
  });
});

window.onload = function() {
  initDebugger(window.debuggerFrame);
};
