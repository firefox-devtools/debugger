
function run_test() {
  try {
    const BrowserLoader = Components.utils.import("resource://devtools/client/shared/browser-loader", {});
    const { require } = BrowserLoader({
      baseURI: "file:///Users/james/projects/mozilla/debugger.html"
    });

    const sources = require('./js/reducers/sources.js');
    dump(sources.toString());
  }
  catch(e) {
    dump(e);
  }

  equal(2, 1);
}
