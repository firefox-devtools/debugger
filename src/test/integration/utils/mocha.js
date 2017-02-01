async function invokeInTab(dbg, fnc) {
  return dbg.client.debuggeeCommand(fnc);
}

module.exports = {
  invokeInTab
}
