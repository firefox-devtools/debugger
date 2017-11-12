/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import PropTypes from "prop-types";
import { Component } from "react";

import { KeyShortcuts } from "devtools-modules";
const shortcuts = new KeyShortcuts({ window });

class Shortcuts extends Component {
  getChildContext() {
    return { shortcuts };
  }

  render() {
    return this.props.children;
  }
}

Shortcuts.childContextTypes = { shortcuts: PropTypes.object };
Shortcuts.propTypes = {
  children: PropTypes.object.isRequired
};

export default Shortcuts;
