/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { isFirefox } from "devtools-environment";
import { transitionTimeout } from "../components/shared/Modal";

export function scrollList(
  resultList: Element[],
  index: number,
  delayed: boolean = false
): void {
  if (!resultList.hasOwnProperty(index)) {
    return;
  }

  const resultEl = resultList[index];

  const scroll = () => {
    if (isFirefox()) {
      resultEl.scrollIntoView({ block: "center", behavior: "smooth" });
    } else {
      chromeScrollList(resultEl, index);
    }
  };

  if (delayed) {
    // Wait for Modal Transition timeout before scrolling to resultEl.
    setTimeout(scroll, transitionTimeout + 10);
    return;
  }

  scroll();
}

function chromeScrollList(elem: Element, index: number): void {
  const resultsEl: any = elem.parentNode;

  if (!resultsEl || resultsEl.children.length === 0) {
    return;
  }

  const resultsHeight: number = resultsEl.clientHeight;
  const itemHeight: number = resultsEl.children[0].clientHeight;
  const numVisible: number = resultsHeight / itemHeight;
  const positionsToScroll: number = index - numVisible + 1;
  const itemOffset: number = resultsHeight % itemHeight;
  const scroll: number = positionsToScroll * (itemHeight + 2) + itemOffset;

  resultsEl.scrollTop = Math.max(0, scroll);
}
