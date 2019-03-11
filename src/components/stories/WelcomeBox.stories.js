// @flow
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import React from "react";
import { storiesOf } from "@storybook/react";
import { WelcomeBox } from "../WelcomeBox";
import { withInfo } from "@storybook/addon-info";

const props = {
  horizontal: false,
  togglePaneCollapse: () => {},
  endPanelCollapsed: false,
  setActiveSearch: () => {},
  openQuickOpen: () => {},
  toggleShortcutsModal: () => {}
};

storiesOf("WelcomeBox", module).add(
  "Default",
  withInfo()(() => <WelcomeBox {...props} />)
);
