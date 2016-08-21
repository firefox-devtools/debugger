var deepMap = function(obj, valueTransform, keyTransform) {
  function isObject(value) {
    return {}.toString.call(value) == '[object Object]';
  }

  function getKeys(value) {
    if (isObject(value)) {
      return Object.keys(value)
    }

    if (!value) {
      return [];
    }

    let keys = [];
    for (i=0; i < value.length; i++) {
      keys.push(i)
    }

    return keys;
  }

  const initialState = isObject(obj) ? {} : [];
  return getKeys(obj).reduce(function(acc, k) {
    if (typeof obj[k] == 'object') {
      const key = keyTransform(k)
      acc[key] = deepMap(obj[k], valueTransform, keyTransform)
    } else {
      acc[k] = valueTransform(obj[k], k)
    }
    return acc
  }, initialState);
}

function sanitizeValue(value, key) {
  if (typeof value != "string") {
    return value;
  }

  if (value.match(/server.*child/)) {
    return value.replace(/server.*child.*\//,"");
  }

  return value;
}

function sanitizeKey(key) {
  if (typeof key != "string") {
    return key;
  }

  if (key.match(/server.*child/)) {
    return key.replace(/server.*child.*\//,"");
  }

  return key;
}

function sanitizeData(data) {
  return deepMap(data, sanitizeValue, sanitizeKey);
}

Object.assign(window, {
  sanitizeData
});
