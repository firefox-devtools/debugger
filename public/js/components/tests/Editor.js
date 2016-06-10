"use strict";

const Editor = require("../Editor");
const { renderComponent } = require("../test-utils");

function getEditorLines($el) {
  return $el.querySelectorAll(".codemirror-line");
}

describe("Editor", function() {
  it("todomvc", function() {
    if (typeof window != "object") {
      return;
    }

    const $el = renderComponent(Editor, "todomvc");
    const lines = getEditorLines($el);
    expect(lines.length).to.equal(46);
    expect(lines[2].innerText).to.equal("var app = app || {};");
  });
});
