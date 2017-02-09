
function triggerMouseEvent({type, props = {}, win, el}) {
  let event = new win.Event(type, {
    "view": win,
    "bubbles": true,
    "cancelable": true,
  });

  const rect = el.getBoundingClientRect();
  event = Object.assign(event, props, {
    clientX: (rect.left + rect.right ) / 2,
    clientY: (rect.top + rect.bottom) / 2
  })

  el.dispatchEvent(event)
}

function clickEl(win, el) {
  triggerMouseEvent({
    type: "mousedown",
    win: win,
    el
  });

  triggerMouseEvent({
    type: "click",
    win: win,
    el
  });

  return triggerMouseEvent({
    type: "mouseup",
    win: win,
    el
  });
}

function rightClickEl(win, el) {
  return triggerMouseEvent({
    type: "contextmenu",
    props: { which: 3 },
    win,
    el
  });
}

module.exports = {
  clickEl,
  rightClickEl
}
