function assert(x) {
  return x;
}

function entries(obj) {
  return Object.keys(obj).map(k => [k, obj[k]]);
};

function toObject(arr) {
  const obj = {};
  for (let [k, v] of arr) {
    obj[k] = v;
  }
  return obj;
};

function executeSoon(fn) {
  // TODO: Use something faster.
  setTimeout(() => {
    fn();
  }, 0);
}

module.exports = { assert, entries, toObject, executeSoon };
