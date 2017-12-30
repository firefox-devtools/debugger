import { Map } from "immutable";
import { updateTree } from "../index";
import { createNode } from "../utils";

function createSourcesMap(sources) {
  const msources = sources.map((s, i) => new Map(s));
  let sourcesMap = Map();
  msources.forEach(s => {
    sourcesMap = sourcesMap.mergeIn([s.get("id")], s);
  });

  return sourcesMap;
}

describe("calls updateTree.js", () => {
  it("updates source tree correclty", () => {
    const sources1 = [
      {
        id: "server1.conn13.child1/39",
        url: "https://davidwalsh.name/"
      }
    ];

    const sources2 = [
      {
        id: "server1.conn13.child1/39",
        url: "https://davidwalsh.name/"
      },
      {
        id: "server1.conn13.child1/37",
        url: "https://davidwalsh.name/source1.js"
      }
    ];

    // set props
    const props = {
      debuggeeUrl: "blah",
      sources: createSourcesMap(sources1)
    };

    // set nextProps
    const nextProps = {
      debuggeeUrl: "blah",
      projectRoot: "",
      sources: createSourcesMap(sources2)
    };

    // set state
    const state = {
      uncollapsedTree: createNode("root", "", []),
      sourceTree: {
        contents: [],
        name: "root",
        path: ""
      }
    };

    const returnvalue = updateTree(nextProps, props, state);
    expect(
      returnvalue.uncollapsedTree.contents[0].contents[0].contents.get("url")
    ).toBe("https://davidwalsh.name/source1.js");
  });
});
