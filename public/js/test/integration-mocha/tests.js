const { commands, utils, setupTestHelpers } = require("./head.js");
const { debuggee } = require("./utils");

function addTodo() {
  debuggee(() => {
    localStorage.clear();
    window.dbg.type("#new-todo", "hi");
    window.dbg.type("#new-todo", "{enter}");
  });

  return utils.waitForTime(1000);
}

async function pausing() {
  await commands.selectSource("todo-view");
  await commands.addBreakpoint(33);
  await commands.addBreakpoint(35);
  await addTodo();
  await commands.stepIn();
  await commands.stepOver();
  await commands.stepOut();
  await commands.resume();
  await utils.waitForPaused();
  await commands.resume();
  await commands.removeBreakpoint(33);
  await commands.removeBreakpoint(35);
  console.log("DONE");
}

window.startTests = async function() {
  await pausing();
};

module.exports = {
  setupTestHelpers
};
