const specialKeysMap = {
  Enter: 13,
  Escape: 27,
  Tab: 9,
};

function keyEvent(eventType, key, win) {
  let event = new win.Event(eventType, {
    bubbles: true,
    cancelable: false,
    view: win,
  });

  const { charCode, keyCode, which } = keyInfo(key, eventType);

  event = Object.assign(event, {
    charCode: charCode,
    keyCode: keyCode,
    which: which,
    key: key,
    code: "",
    location: 0,
    detail: 0,
    layerX: 0,
    layerY: 0,
    pageX: 0,
    pageY: 0,
    shiftKey: false,
    altKey: false,
    ctrlKey: false,
    metaKey: false,
  });

  return event;
}

function pressKey(dbg, key) {
  const win = dbg.win;
  const element = dbg.win.document.activeElement;

  element.dispatchEvent(keyEvent("keydown", key, win));
  element.dispatchEvent(keyEvent("keypress", key, win));
  if (key.length == 1) {
    element.value += key;
  }
  element.dispatchEvent(keyEvent("keyup", key, win));
}

function type(dbg, string) {
  string.split("").forEach(char => pressKey(dbg, char));
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
    which: charCodeAt,
  };
}

module.exports = { type, pressKey };
