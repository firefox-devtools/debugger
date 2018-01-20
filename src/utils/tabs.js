import React from "react";
/*
 * Finds the hidden tabs by comparing the tabs' top offset.
 * hidden tabs will have a great top offset.
 *
 * @param sourceTabs Immutable.list
 * @param sourceTabEls HTMLCollection
 *
 * @returns Immutable.list
 */
import { isPretty } from "./source";

export function getHiddenTabs(sourceTabs: SourcesList, sourceTabEls) {
  sourceTabEls = [].slice.call(sourceTabEls);
  function getTopOffset() {
    const topOffsets = sourceTabEls.map(t => t.getBoundingClientRect().top);
    return Math.min(...topOffsets);
  }

  function hasTopOffset(el) {
    // adding 10px helps account for cases where the tab might be offset by
    // styling such as selected tabs which don't have a border.
    const tabTopOffset = getTopOffset();
    return el.getBoundingClientRect().top > tabTopOffset + 10;
  }

  return sourceTabs.filter((tab, index) => {
    const element = sourceTabEls[index];
    return element && hasTopOffset(element);
  });
}

export function getSourceAnnotation(source, metaData) {
  const sourceId = source.get("id");
  const sourceMetaData = metaData[sourceId];

  if (metaData && metaData.isReactComponent) {
    return <img className="react" />;
  }
  if (isPretty(source)) {
    return <img className="prettyPrint" />;
  }
  if (source.get("isBlackBoxed")) {
    return <img className="blackBox" />;
  }
}
