function Debuggee() {
  function $(selector) {
    const element = document.querySelector(selector);
    console.log("$", selector, element);

    if (!element) {
      throw new Error("Element not found, try changing the selector");
    }
    return element;
  }

  function mouseEvent(eventType) {
    return new MouseEvent(eventType, {
      view: window,
      bubbles: true,
      cancelable: true
    });
  }

  const specialKeysMap = {
    "{enter}": 13
  };

  // Special character examples {enter}, {esc}, {leftarrow} ..
  function isSpecialCharacter(text) {
    return text.match(/^\{.*\}$/);
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

  function sendKey(element, key) {
    element.dispatchEvent(keyEvent("keydown", key));
    element.dispatchEvent(keyEvent("keypress", key));
    if (key.length == 1) {
      element.value += key;
    }
    element.dispatchEvent(keyEvent("keyup", key));
  }

  function click(selector) {
    const element = $(selector);
    console.log("click", selector);
    element.dispatchEvent(mouseEvent("click"));
  }

  function dblclick(selector) {
    const element = $(selector);
    console.log("dblclick", selector);
    element.dispatchEvent(mouseEvent("dblclick"));
  }

  function type(selector, text) {
    const element = $(selector);
    console.log("type", selector, text);
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
  };
}

const debuggeeStatement = `window.dbg = (${Debuggee})()`;
let injectedDebuggee;

function injectDebuggee(win = window) {
  if (injectedDebuggee) {
    return Promise.resolve(injectedDebuggee);
  }

  return win.client.debuggeeCommand(debuggeeStatement).then(result => {
    injectedDebuggee = result;
  });
}

module.exports = injectDebuggee;
