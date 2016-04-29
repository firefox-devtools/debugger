"use strict";

const { createStore } = require("../../util/test-head");
const { Task } = require("ff-devtools-libs/sham/task");
// const expect = require("expect.js");

const simpleMockThreadClient = {
  source: function(form) {
    return {
      setBreakpoint: args => {
        return new Promise((resolve, reject) => {
          resolve({}, {
            actor: form.actor
          });
        });
      }
    };
  }
};

describe("breakpoints", () => {
  it("should add a breakpoint", () => {
    Task.spawn(function* () {
      const store = createStore(simpleMockThreadClient);
      return store;
      // yield actions.addBreakpoint({ line: 5 });
      // expect(queries.getBreakpoints(store.getState()).length).to.be(2);
    });
  });
});
