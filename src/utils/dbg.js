import { bindActionCreators } from "redux";
import * as timings from "./timings";
import { prefs, features } from "./prefs";

export function setupHelper(obj) {
  const selectors = Object.keys(obj.selectors).reduce((bound, selector) => {
    bound[selector] = (a, b, c) =>
      obj.selectors[selector](obj.store.getState(), a, b, c);
    return bound;
  }, {});

  const actions = bindActionCreators(obj.actions, obj.store.dispatch);
  window.dbg = {
    ...obj,
    selectors,
    actions,
    prefs,
    features,
    timings
  };

  console.group("Development Notes");
  const baseUrl = "https://devtools-html.github.io/debugger.html";
  const localDevelopmentUrl = `${baseUrl}/docs/local-development.html`;
  console.log("Debugging Tips", localDevelopmentUrl);
  console.log("dbg", window.dbg);
  console.groupEnd();
}
