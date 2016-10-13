/*
 * A sham for https://developer.mozilla.org/en-US/Add-ons/SDK/Low-Level_APIs/chrome
 */

var { inDOMUtils } = require("./inDOMUtils");

var ourServices = {
  inIDOMUtils: inDOMUtils,
  nsIClipboardHelper: {
    copyString: () => {}
  },
  nsIXULChromeRegistry: {
    isLocaleRTL: () => {return false;}
  },
  nsIDOMParser: {

  },
};

module.exports = {
  Cc: name => {
    if(typeof console !== "undefined") {
      console.log('Cc sham for', name);
    }
    return {
      getService: (name) => ourServices[name],
      createInstance: (iface) => ourServices[iface],
    };
  },
  CC: (name, iface, method) => {
    if(typeof console !== "undefined") {
      console.log('CC sham for', name, iface, method);
    }
    return {
    };
  },
  Ci: {
    nsIThread: {
      "DISPATCH_NORMAL":0,
      "DISPATCH_SYNC":1
    },
    nsIDOMNode: typeof HTMLElement !== "undefined" ? HTMLElement : null,
    nsIFocusManager: {
      MOVEFOCUS_BACKWARD: 2,
      MOVEFOCUS_FORWARD: 1,
    },
    nsIDOMKeyEvent: {

    },
    nsIDOMCSSRule: {"UNKNOWN_RULE":0,"STYLE_RULE":1,"CHARSET_RULE":2,"IMPORT_RULE":3,"MEDIA_RULE":4,"FONT_FACE_RULE":5,"PAGE_RULE":6,"KEYFRAMES_RULE":7,"KEYFRAME_RULE":8,"MOZ_KEYFRAMES_RULE":7,"MOZ_KEYFRAME_RULE":8,"NAMESPACE_RULE":10,"COUNTER_STYLE_RULE":11,"SUPPORTS_RULE":12,"FONT_FEATURE_VALUES_RULE":14},
    inIDOMUtils: "inIDOMUtils",
    nsIClipboardHelper: "nsIClipboardHelper",
    nsIXULChromeRegistry: "nsIXULChromeRegistry",
  },
  Cu: {
    reportError: msg => { (typeof console !== "undefined") ? console.error(msg) : dump(msg) },
    callFunctionWithAsyncStack: fn => fn(),
  },
  Cr: {},
  components: {
    isSuccessCode: () => (returnCode & 0x80000000) === 0,
  }
};
