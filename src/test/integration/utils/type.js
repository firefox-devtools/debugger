const specialKeysMap = {
  "Enter": 13
};

function keyEvent(eventType, key, win) {
  let event = new win.Event(eventType, {
    bubbles: true,
    cancelable: false,
    view: win
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

function pressKey(dbg, element, key) {
  const win = dbg.win;
  element.dispatchEvent(keyEvent("keydown", key, win));
  element.dispatchEvent(keyEvent("keypress", key, win));
  if (key.length == 1) {
    element.value += key;
  }
  element.dispatchEvent(keyEvent("keyup", key, win));
}

function type(dbg, element, string) {
  string.split("")
        .forEach(char => pressKey(dbg, element, char));
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
