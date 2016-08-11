const Frames = require("../Frames");
const { renderComponent } = require("../test-utils");

function getFrames($el) {
  return $el.querySelectorAll(".frame");
}

function getFrameTitle($frame) {
  return $frame.firstChild.innerText.trim();
}

function getFrameLocation($frame) {
  return $frame.lastChild.innerText.trim();
}

describe("Frames", function() {
  it("Not Paused", function() {
    if (typeof window != "object") {
      return;
    }

    const $el = renderComponent(Frames, "todomvc");
    expect($el.innerText).to.equal("Not Paused");
  });

  it("Event Handler", function() {
    if (typeof window != "object") {
      return;
    }

    const $el = renderComponent(Frames, "todomvcUpdateOnEnter");
    const frames = getFrames($el);
    expect(frames.length).to.equal(13);
    expect(getFrameTitle(frames[0])).to.equal("app.TodoView<.updateOnEnter");
    expect(getFrameLocation(frames[0])).to.equal("todo-view.js: 113");
    expect(getFrameTitle(frames[3])).to.equal(".save");
    // lastChild is the firstChild, there is no empty div present
    expect(getFrameLocation(frames[5])).to.equal("backbone.localStorage.js: 1");
  });

  it("Nested Closure", function() {
    if (typeof window != "object") {
      return;
    }

    const $el = renderComponent(Frames, "pythagorean");
    const frames = getFrames($el);
    expect(frames.length).to.equal(3);
    expect(getFrameTitle(frames[0])).to.equal("pythagorean");
    expect(getFrameLocation(frames[0])).to.equal("pythagorean.js: 11");
  });
});
