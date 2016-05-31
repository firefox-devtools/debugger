function Debuggee () {
  function $(selector) {
    return document.querySelector(selector);
  }

  function mouseEvent(type) {
    return new MouseEvent(type, {
      "view": window,
      "bubbles": true,
      "cancelable": true
    });
  }

  const specialKeysMap = {
    "{enter}": 13
  }

  // Special character examples {enter}, {esc}, {leftarrow} ..
  function isSpecialCharacter(text) {
    return text.match(/^\{.*\}$/)
  }

  function keyInfo(key) {
    let charCodeAt;

    if (key.length > 1) {
        charCodeAt = specialKeysMap[key];
    } else {
      charCodeAt = key.toUpperCase().charCodeAt(0);
    }

    return {
      charCode: type == "keypress" ? 0 : charCodeAt,
      keyCode: charCodeAt,
      which: charCodeAt
    };
  }

  function keyEvent(type, key) {
    const event = new Event(type, {
      bubbles: true,
      cancelable: false,
      view: window
    });

    const {charCode, keyCode, which} = keyInfo(key);

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

  function sendKey(element, key) {
    element.dispatchEvent(keyEvent("keydown", key));
    element.dispatchEvent(keyEvent("keypress", key));
    if (key.length == 1) {
      element.value += key;
    }
    element.dispatchEvent(keyEvent("keyup", key));
  }

  function click(selector) {
    $(selector).dispatchEvent(mouseEvent("click"));
  }

  function dblclick(selector) {
    $(selector).dispatchEvent(mouseEvent("dblclick"));
  }

  function type(selector, text) {
    const element = $(selector);
    element.select();

    if (isSpecialCharacter(text)) {
      sendKey(element, text);
    } else {
      const chars = text.split("");
      chars.forEach(char => sendKey(element, char));
    }
  }

  return {
    click,
    dblclick,
    type
  }
}

const debuggeeStatement = `window.Debuggee = (${Debuggee})()`;
let injectedDebuggee;

function injectDebuggee() {
  if (injectedDebuggee) {
    return Promise.resolve(injectedDebuggee);
  }

  return apiClient.evaluate(debuggeeStatement).then(result => {
    injectedDebuggee = result;
  })
}

module.exports = injectDebuggee;
