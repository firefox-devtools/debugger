import aDefault from "./src/mod1";
import { aNamed } from "./src/mod2";
import { original as anAliased } from "./src/mod3";
import * as aNamespace from "./src/mod4";

import aDefault2 from "./src/mod5";
import { aNamed2 } from "./src/mod6";
import { original as anAliased2 } from "./src/mod7";
import * as aNamespace2 from "./src/mod8";

import aDefault3 from "./src/mod9";
import { aNamed3 } from "./src/mod10";
import { original as anAliased3 } from "./src/mod11";
import * as aNamespace3 from "./src/mod12";

export default function root() {
  console.log("pause here", root);

  console.log(aDefault);
  console.log(anAliased);
  console.log(aNamed);
  console.log(anAliased);
  console.log(aNamespace);

  try {
    // None of these are callable in this code, but we still want to make sure
    // they map properly even if the only reference is in a call expressions.
    console.log(aDefault2());
    console.log(anAliased2());
    console.log(aNamed2());
    console.log(anAliased2());
    console.log(aNamespace2());

    console.log(new aDefault3());
    console.log(new anAliased3());
    console.log(new aNamed3());
    console.log(new anAliased3());
    console.log(new aNamespace3());
  } catch (e) {}
}

// The build harness sets the wrong global, so just override it.
Promise.resolve().then(() => {
  window.webpackModules = root;
});
