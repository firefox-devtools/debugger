/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React from "react";

import type { SourceRecord } from "../reducers/sources";
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

export function getSourceAnnotation(source: SourceRecord, getMetaData) {
  const sourceId = source.get("id");
  const sourceMetaData = getMetaData(sourceId);

  if (sourceMetaData && sourceMetaData.isReactComponent) {
    return <img className="react" />;
  }
  if (isPretty(source)) {
    return <img className="prettyPrint" />;
  }
  if (source.get("isBlackBoxed")) {
    return <img className="blackBox" />;
  }
}
