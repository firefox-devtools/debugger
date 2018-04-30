import { getTokenLocation } from ".";
import { isEqual } from "lodash";

/*
 * tokenEvents introduces two new codeMirror events `tokenEnter` and `tokenLeave`, which have helpful properties:
 *
 * - tokenEnter is triggered once per token
 * - tokenEnter is only fired for tokens that we could preview or jump to. Not whitespace, syntax, ...
 * - tokenLeave is triggered immediately after the mouse leaves the element
*/

function isInvalidTarget(target: HTMLElement) {
  if (!target || !target.innerText) {
    return true;
  }

  const tokenText = target.innerText.trim();
  const cursorPos = target.getBoundingClientRect();

  // exclude literal tokens where it does not make sense to show a preview
  const invalidType = ["cm-atom", ""].includes(target.className);

  // exclude syntax where the expression would be a syntax error
  const invalidToken =
    tokenText === "" || tokenText.match(/^[(){}\|&%,.;=<>\+-/\*\s](?=)/);

  // exclude codemirror elements that are not tokens
  const invalidTarget =
    (target.parentElement &&
      !target.parentElement.closest(".CodeMirror-line")) ||
    cursorPos.top == 0;

  const invalidClasses = ["bracket-arrow", "gap", "editor-mount"];
  if (invalidClasses.some(className => target.classList.contains(className))) {
    return true;
  }

  return invalidTarget || invalidToken || invalidType;
}

function dispatch(codeMirror, eventName, data) {
  codeMirror.constructor.signal(codeMirror, eventName, data);
}

function invalidLeaveTarget(target) {
  const invalidClasses = ["bracket-arrow", "gap"];
  if (invalidClasses.some(className => target.classList.contains(className))) {
    return true;
  }

  return false;
}

export function onMouseOver(codeMirror) {
  let prevTokenPos = null;

  function onMouseLeave(event) {
    if (invalidLeaveTarget(event.relatedTarget)) {
      return addMouseLeave(event.target);
    }

    prevTokenPos = null;
    dispatch(codeMirror, "tokenleave", event);
  }

  function addMouseLeave(target) {
    target.addEventListener("mouseleave", onMouseLeave, {
      capture: true,
      once: true
    });
  }

  return enterEvent => {
    const { target } = enterEvent;

    if (isInvalidTarget(target)) {
      return;
    }

    const wrapper = codeMirror.getWrapperElement();
    const tokenPos = getTokenLocation(codeMirror, target);

    if (!isEqual(prevTokenPos, tokenPos)) {
      addMouseLeave(target);

      dispatch(codeMirror, "tokenenter", {
        event: enterEvent,
        target,
        tokenPos
      });
      prevTokenPos = tokenPos;
    }
  };
}
