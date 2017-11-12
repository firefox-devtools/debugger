import { onConnect } from "../../firefox";

const tabTarget = {
  on: () => {},
  _form: {
    url: "url"
  }
};

const threadClient = {
  addListener: () => {},
  reconfigure: () => {},
  getSources: () => {
    return {
      sources: [
        {
          id: "s.js",
          url: "file:///tmp/s.js"
        }
      ]
    };
  },
  getLastPausePacket: () => null,
  _parent: {
    listWorkers: () => new Promise(resolve => resolve({ workers: [] }))
  }
};

const debuggerClient = {
  mainRoot: {
    traits: {}
  }
};

const actions = {
  _sources: [],
  connect: () => {},
  setWorkers: () => {},
  newSources: function(sources) {
    return new Promise(resolve => {
      setTimeout(() => {
        this._sources = sources;
        resolve();
      }, 0);
    });
  }
};

describe("firefox onConnect", () => {
  it("wait for sources at startup", async () => {
    await onConnect(
      {
        tabConnection: {
          tabTarget,
          threadClient,
          debuggerClient
        }
      },
      actions
    );
    expect(actions._sources.length).toEqual(1);
    expect(actions._sources[0].url).toEqual("file:///tmp/s.js");
  });
});
