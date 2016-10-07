let DEFAULTS = require("../../preferences.js");

// TODO Can make this localStorage or something in the future?
let storage = JSON.parse(JSON.stringify(DEFAULTS));

const PREF_INVALID = exports.PREF_INVALID = 0;
const PREF_STRING = exports.PREF_STRING = 32;
const PREF_INT = exports.PREF_INT = 64;
const PREF_BOOL = exports.PREF_BOOL = 128;

/**
 * Returns a `Pref` object containing the following properties:
 *
 * `value` - The primitive value of the stored preference.
 * `type` - The enum type of the pref. Can be PREF_INVALID, PREF_STRING, PREF_INT, or PREF_BOOL.
 */
function findPref (pref) {
  let branchNames = pref.split(".");
  let branch = storage;

  for (let branchName of branchNames) {
    branch = branch[branchName];
    if (!branch) {
      branch = {};
    }
  }

  return branch;
}

function setPrefValue (pref, value) {
  let obj = findPref(pref);
  obj.value = value;
}

function getPrefValue (pref) {
  return findPref(pref).value;
}


const addObserver = exports.addObserver = function (domain, observer, holdWeak) {
  console.log("TODO implement addObserver");
};

const removeObserver = exports.removeObserver = function (domain, observer, holdWeak) {
  console.log("TODO implement removeObserver");
};

const resetPrefs = exports.resetPrefs = function () {
  storage = JSON.parse(JSON.stringify(DEFAULTS));
};

const getPrefType = exports.getPrefType = function (pref) {
  return findPref(pref).type;
};

const setBoolPref = exports.setBoolPref = function (pref, value) {
  if (typeof value !== "boolean") {
    throw new Error("Cannot setBoolPref without a boolean.");
  }
  if (getPrefType(pref) && getPrefType(pref) !== PREF_BOOL) {
    throw new Error("Can only call setBoolPref on boolean type prefs.");
  }
  setPrefValue(pref, value);
};

exports.setCharPref = function (pref, value) {
  if (typeof value !== "string") {
    throw new Error("Cannot setCharPref without a string.");
  }
  if (getPrefType(pref) && getPrefType(pref) !== PREF_STRING) {
    throw new Error("Can only call setCharPref on string type prefs.");
  }
  setPrefValue(pref, value);
};

exports.setIntPref = function (pref, value) {
  if (typeof value !== "number" && (parseInt(value) !== value)) {
    throw new Error("Cannot setCharPref without an integer.");
  }
  if (getPrefType(pref) && getPrefType(pref) !== PREF_INT) {
    throw new Error("Can only call setIntPref on number type prefs.");
  }
  setPrefValue(pref, value);
};

exports.getBoolPref = function (pref) {
  if (getPrefType(pref) !== PREF_BOOL) {
    console.log(`No cached boolean pref for ${pref}`);
    return undefined;
  }
  return getPrefValue(pref);
};

exports.getCharPref = function (pref) {
  if (getPrefType(pref) !== PREF_STRING) {
    console.log(`No cached char pref for ${pref}`);
    return undefined;
  }
  return getPrefValue(pref);
};

exports.getIntPref = function (pref) {
  if (getPrefType(pref) !== PREF_INT) {
    console.log(`No cached int pref for ${pref}`);
    return undefined;
  }
  return getPrefValue(pref);
};

exports.getComplexValue = function (pref) {
  // XXX: Implement me
  return  {
    data: ''
  }
};

exports.getBranch = function (pref) {
  return {
    addObserver: () => {},
    removeObserver: () => {},
  }
};

exports.prefHasUserValue = function (pref) {
  // XXX: Implement me
  return false;
};
