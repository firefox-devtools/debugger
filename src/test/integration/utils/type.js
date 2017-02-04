const specialKeysMap = {
  "{enter}": 13
};

function keyEvent(eventType, key) {
  const event = new Event(eventType, {
    bubbles: true,
    cancelable: false,
    view: window
  });

  const { charCode, keyCode, which } = keyInfo(key, eventType);

  return Object.assign(event, {
    charCode: charCode,
    keyCode: keyCode,
    which: which,
    detail: 0,
    layerX: 0,
    layerY: 0,
    pageX: 0,
    pageY: 0
  });
}

function pressKey(element, key) {
  element.dispatchEvent(keyEvent("keydown", key));
  element.dispatchEvent(keyEvent("keypress", key));
  if (key.length == 1) {
    element.value += key;
  }
  element.dispatchEvent(keyEvent("keyup", key));
}

function type(element, string) {
  string.split("")
        .forEach(char => pressKey(element, char));
}

function keyInfo(key, eventType) {
  let charCodeAt;

  if (key.length > 1) {
    charCodeAt = specialKeysMap[key];
  } else {
    charCodeAt = key.toUpperCase().charCodeAt(0);
  }

  return {
    charCode: eventType == "keypress" ? 0 : charCodeAt,
    keyCode: charCodeAt,
    which: charCodeAt
  };
}

module.exports = {type, pressKey};
