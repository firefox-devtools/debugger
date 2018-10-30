/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import { isFirefoxPanel } from "devtools-environment";
let l10n;

export function getL10n() {
  if (!l10n) {
    if (isFirefoxPanel()) {
      const { LocalizationHelper } = require("devtools/shared/l10n");
      l10n = new LocalizationHelper(
        "devtools/client/locales/debugger.properties"
      );
    } else {
      l10n = window.L10N;
    }
  }
  return l10n;
}
