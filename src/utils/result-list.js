/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { isFirefox } from "devtools-environment";
import { transitionTimeout } from "../components/shared/Modal";

export function scrollList(resultList, index, delayed = false) {
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

function chromeScrollList(elem, index) {
  const resultsEl = elem.parentNode;
  if (!resultsEl || resultsEl.children.length === 0) {
    return;
  }

  const resultsHeight = resultsEl.clientHeight;
  const itemHeight = resultsEl.children[0].clientHeight;
  const numVisible = resultsHeight / itemHeight;
  const positionsToScroll = index - numVisible + 1;
  const itemOffset = resultsHeight % itemHeight;
  const scroll = positionsToScroll * (itemHeight + 2) + itemOffset;

  resultsEl.scrollTop = Math.max(0, scroll);
}
