/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/* global jest */
const { shallow } = require("enzyme");
const {
  REPS,
  getRep
} = require("../rep");

const {
  expectActorAttribute
} = require("./test-helpers");

const { ErrorRep } = REPS;
const { MODE } = require("../constants");
const stubs = require("../stubs/error");

describe("Error - Simple error", () => {
  // Test object = `new Error("Error message")`
  const stub = stubs.get("SimpleError");

  it("correctly selects Error Rep for Error object", () => {
    expect(getRep(stub)).toBe(ErrorRep.rep);
  });

  it("renders with expected text for simple error", () => {
    const renderedComponent = shallow(ErrorRep.rep({
      object: stub
    }));

    expect(renderedComponent).toMatchSnapshot();
    expectActorAttribute(renderedComponent, stub.actor);
  });

  it("renders with expected text for simple error in tiny mode", () => {
    const renderedComponent = shallow(ErrorRep.rep({
      object: stub,
      mode: MODE.TINY
    }));

    expect(renderedComponent.text()).toEqual("Error");
  });
});

describe("Error - Multi line stack error", () => {
  /*
   * Test object = `
   *   function errorFoo() {
   *     errorBar();
   *   }
   *   function errorBar() {
   *     console.log(new Error("bar"));
   *   }
   *   errorFoo();`
   */
  const stub = stubs.get("MultilineStackError");

  it("correctly selects the Error Rep for Error object", () => {
    expect(getRep(stub)).toBe(ErrorRep.rep);
  });

  it("renders with expected text for Error object", () => {
    const renderedComponent = shallow(ErrorRep.rep({
      object: stub
    }));

    expect(renderedComponent).toMatchSnapshot();
  });

  it("renders expected text for simple error with a multiple line in tiny mode", () => {
    const renderedComponent = shallow(ErrorRep.rep({
      object: stub,
      mode: MODE.TINY
    }));

    expect(renderedComponent.text()).toEqual("Error");
  });
});

describe("Error - Error without stacktrace", () => {
  const stub = stubs.get("ErrorWithoutStacktrace");

  it("correctly selects the Error Rep for Error object", () => {
    expect(getRep(stub)).toBe(ErrorRep.rep);
  });

  it("renders with expected text for Error object", () => {
    const renderedComponent = shallow(ErrorRep.rep({
      object: stub
    }));

    expect(renderedComponent.text()).toEqual("Error: \"Error message\"");
  });

  it("renders expected text for simple error without stacktrace in tiny mode", () => {
    const renderedComponent = shallow(ErrorRep.rep({
      object: stub,
      mode: MODE.TINY
    }));

    expect(renderedComponent.text()).toEqual("Error");
  });
});

describe("Error - Eval error", () => {
  // Test object = `new EvalError("EvalError message")`
  const stub = stubs.get("EvalError");

  it("correctly selects the Error Rep for EvalError object", () => {
    expect(getRep(stub)).toBe(ErrorRep.rep);
  });

  it("renders with expected text for an EvalError", () => {
    const renderedComponent = shallow(ErrorRep.rep({
      object: stub
    }));

    expect(renderedComponent).toMatchSnapshot();
  });

  it("renders with expected text for an EvalError in tiny mode", () => {
    const renderedComponent = shallow(ErrorRep.rep({
      object: stub,
      mode: MODE.TINY
    }));

    expect(renderedComponent.text()).toEqual("EvalError");
  });
});

describe("Error - Internal error", () => {
  // Test object = `new InternalError("InternalError message")`
  const stub = stubs.get("InternalError");

  it("correctly selects the Error Rep for InternalError object", () => {
    expect(getRep(stub)).toBe(ErrorRep.rep);
  });

  it("renders with expected text for an InternalError", () => {
    const renderedComponent = shallow(ErrorRep.rep({
      object: stub
    }));

    expect(renderedComponent).toMatchSnapshot();
  });

  it("renders with expected text for an InternalError in tiny mode", () => {
    const renderedComponent = shallow(ErrorRep.rep({
      object: stub,
      mode: MODE.TINY
    }));

    expect(renderedComponent.text()).toEqual("InternalError");
  });
});

describe("Error - Range error", () => {
  // Test object = `new RangeError("RangeError message")`
  const stub = stubs.get("RangeError");

  it("correctly selects the Error Rep for RangeError object", () => {
    expect(getRep(stub)).toBe(ErrorRep.rep);
  });

  it("renders with expected text for RangeError", () => {
    const renderedComponent = shallow(ErrorRep.rep({
      object: stub
    }));

    expect(renderedComponent).toMatchSnapshot();
  });

  it("renders with expected text for RangeError in tiny mode", () => {
    const renderedComponent = shallow(ErrorRep.rep({
      object: stub,
      mode: MODE.TINY
    }));

    expect(renderedComponent.text()).toEqual("RangeError");
  });
});

describe("Error - Reference error", () => {
  // Test object = `new ReferenceError("ReferenceError message"`
  const stub = stubs.get("ReferenceError");

  it("correctly selects the Error Rep for ReferenceError object", () => {
    expect(getRep(stub)).toBe(ErrorRep.rep);
  });

  it("renders with expected text for ReferenceError", () => {
    const renderedComponent = shallow(ErrorRep.rep({
      object: stub
    }));

    expect(renderedComponent).toMatchSnapshot();
  });

  it("renders with expected text for ReferenceError in tiny mode", () => {
    const renderedComponent = shallow(ErrorRep.rep({
      object: stub,
      mode: MODE.TINY
    }));

    expect(renderedComponent.text()).toEqual("ReferenceError");
  });
});

describe("Error - Syntax error", () => {
  // Test object = `new SyntaxError("SyntaxError message"`
  const stub = stubs.get("SyntaxError");

  it("correctly selects the Error Rep for SyntaxError object", () => {
    expect(getRep(stub)).toBe(ErrorRep.rep);
  });

  it("renders with expected text for SyntaxError", () => {
    const renderedComponent = shallow(ErrorRep.rep({
      object: stub
    }));

    expect(renderedComponent).toMatchSnapshot();
  });

  it("renders with expected text for SyntaxError in tiny mode", () => {
    const renderedComponent = shallow(ErrorRep.rep({
      object: stub,
      mode: MODE.TINY
    }));

    expect(renderedComponent.text()).toEqual("SyntaxError");
  });
});

describe("Error - Type error", () => {
  // Test object = `new TypeError("TypeError message"`
  const stub = stubs.get("TypeError");

  it("correctly selects the Error Rep for TypeError object", () => {
    expect(getRep(stub)).toBe(ErrorRep.rep);
  });

  it("renders with expected text for TypeError", () => {
    const renderedComponent = shallow(ErrorRep.rep({
      object: stub
    }));

    expect(renderedComponent).toMatchSnapshot();
  });

  it("renders with expected text for TypeError in tiny mode", () => {
    const renderedComponent = shallow(ErrorRep.rep({
      object: stub,
      mode: MODE.TINY
    }));

    expect(renderedComponent.text()).toEqual("TypeError");
  });
});

describe("Error - URI error", () => {
  // Test object = `new URIError("URIError message")`
  const stub = stubs.get("URIError");

  it("correctly selects the Error Rep for URIError object", () => {
    expect(getRep(stub)).toBe(ErrorRep.rep);
  });

  it("renders with expected text for URIError", () => {
    const renderedComponent = shallow(ErrorRep.rep({
      object: stub
    }));

    expect(renderedComponent).toMatchSnapshot();
  });

  it("renders with expected text for URIError in tiny mode", () => {
    const renderedComponent = shallow(ErrorRep.rep({
      object: stub,
      mode: MODE.TINY
    }));

    expect(renderedComponent.text()).toEqual("URIError");
  });
});

describe("Error - DOMException", () => {
  const stub = stubs.get("DOMException");

  it("correctly selects Error Rep for Error object", () => {
    expect(getRep(stub)).toBe(ErrorRep.rep);
  });

  it("renders with expected text for DOMException", () => {
    const renderedComponent = shallow(ErrorRep.rep({
      object: stub
    }));

    expect(renderedComponent.text()).toEqual(
      "DOMException: \"'foo;()bar!' is not a valid selector\""
    );
  });

  it("renders with expected text for DOMException in tiny mode", () => {
    const renderedComponent = shallow(ErrorRep.rep({
      object: stub,
      mode: MODE.TINY
    }));

    expect(renderedComponent.text()).toEqual("DOMException");
  });
});

describe("Error - base-loader.js", () => {
  const stub = stubs.get("base-loader Error");

  it("renders as expected without mode", () => {
    const renderedComponent = shallow(ErrorRep.rep({
      object: stub
    }));

    expect(renderedComponent).toMatchSnapshot();
  });

  it("renders as expected in tiny mode", () => {
    const renderedComponent = shallow(ErrorRep.rep({
      object: stub,
      mode: MODE.TINY
    }));

    expect(renderedComponent).toMatchSnapshot();
  });
});

describe("Error - longString stacktrace", () => {
  const stub = stubs.get("longString stack Error");

  it("renders as expected", () => {
    const renderedComponent = shallow(ErrorRep.rep({
      object: stub
    }));

    expect(renderedComponent).toMatchSnapshot();
  });
});

describe("Error - stacktrace location click", () => {
  it("Calls onViewSourceInDebugger with the expected arguments", () => {
    const onViewSourceInDebugger = jest.fn();
    const object = stubs.get("base-loader Error");

    const renderedComponent = shallow(ErrorRep.rep({
      object,
      onViewSourceInDebugger
    }));

    const locations = renderedComponent.find(".objectBox-stackTrace-location");
    expect(locations.exists()).toBeTruthy();

    expect(locations.first().prop("title")).toBe("View source in debugger → " +
      "resource://devtools/shared/client/debugger-client.js:856:9");
    locations.first().simulate("click", {
      type: "click",
      stopPropagation: () => {},
    });

    expect(onViewSourceInDebugger.mock.calls.length).toEqual(1);
    let mockCall = onViewSourceInDebugger.mock.calls[0][0];
    expect(mockCall.url).toEqual("resource://devtools/shared/client/debugger-client.js");
    expect(mockCall.line).toEqual(856);
    expect(mockCall.column).toEqual(9);

    expect(locations.last().prop("title")).toBe("View source in debugger → " +
      "resource://devtools/shared/ThreadSafeDevToolsUtils.js:109:14");
    locations.last().simulate("click", {
      type: "click",
      stopPropagation: () => {},
    });

    expect(onViewSourceInDebugger.mock.calls.length).toEqual(2);
    mockCall = onViewSourceInDebugger.mock.calls[1][0];
    expect(mockCall.url).toEqual("resource://devtools/shared/ThreadSafeDevToolsUtils.js");
    expect(mockCall.line).toEqual(109);
    expect(mockCall.column).toEqual(14);
  });

  it("Does not call onViewSourceInDebugger on excluded urls", () => {
    const onViewSourceInDebugger = jest.fn();
    const object = stubs.get("URIError");

    const renderedComponent = shallow(ErrorRep.rep({
      object,
      onViewSourceInDebugger
    }));

    const locations = renderedComponent.find(".objectBox-stackTrace-location");
    expect(locations.exists()).toBeTruthy();
    expect(locations.first().prop("title")).toBe(undefined);

    locations.first().simulate("click", {
      type: "click",
      stopPropagation: () => {},
    });

    expect(onViewSourceInDebugger.mock.calls.length).toEqual(0);
  });

  it("Does not throw when onViewSourceInDebugger props is not provided", () => {
    const object = stubs.get("base-loader Error");

    const renderedComponent = shallow(ErrorRep.rep({
      object,
    }));

    const locations = renderedComponent.find(".objectBox-stackTrace-location");
    expect(locations.exists()).toBeTruthy();
    expect(locations.first().prop("title")).toBe(undefined);

    locations.first().simulate("click", {
      type: "click",
      stopPropagation: () => {},
    });
  });
});
