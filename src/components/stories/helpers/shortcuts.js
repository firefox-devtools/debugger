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
