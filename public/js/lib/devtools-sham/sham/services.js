/*
 * A sham for https://dxr.mozilla.org/mozilla-central/source/toolkit/modules/Services.jsm
 */

const L10N = require("devtools-sham/sham/l10n");
const Services = { };

Services.strings = {
  createBundle: name => {
    if (typeof name !== "object") {
      throw new Error(`Cannot implement 'Services.strings.createBundle'. Use 'new L10N(require(${name}))' instead, or call this with the return value of a require, like 'Services.strings.createBundle(require(${name}))'.`);
    }
    return new L10N(name);
  }
};

Services.appinfo = {
  OS: 'Darwin', // Probably
};

Services.telemetry = {
  getHistogramById() {
    return {
      add() {}
    };
  },
};

Services.obs = {
  addObserver: () => {},
  removeObserver: () => {},
}
Services.prefs = require("devtools-sham/sham/services/prefs");

Services.tm = {
  currentThread: {
    dispatch: (cb) => {
      setImmediate(cb);
    }
  },
  mainThread: {
    dispatch: (cb) => {
      setImmediate(cb);
    }
  }
};

Services.scriptloader = {
  /**
   * Implements a subset of loadSubScript, to inject scripts into a window, rather
   * than an arbitrary scope.
   * @see https://developer.mozilla.org/en-US/docs/Mozilla/Tech/XPCOM/Reference/Interface/mozIJSSubScriptLoader#loadSubScript%28%29
   */
  loadSubScript: (url, target, charset="utf8") => {
    // Only implement scenario where target has reference to a document
    if (!target || !target.document) {
      throw new Error(`target in loadSubScript does not have a document.`);
    }
    return new Promise(resolve => {
      let script = target.document.createElement("script");
      script.src = url;
      script.onload = resolve
      target.document.body.appendChild(script);
    });
  }
};

module.exports.Services = Services;
