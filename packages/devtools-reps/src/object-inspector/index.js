/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
const { createElement, createFactory, PureComponent } = require("react");
const { Provider } = require("react-redux");
const ObjectInspector = createFactory(require("./component"));
const createStore = require("./store");
const Utils = require("./utils");
const { renderRep, shouldRenderRootsInReps } = Utils;

import type { Props, Store } from "./types";

class OI extends PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.store = createStore(props);
  }

  store: Store;

  getStore() {
    return this.store;
  }

  render() {
    return createElement(
      Provider,
      { store: this.store },
      ObjectInspector(this.props)
    );
  }
}

module.exports = (props: Props) => {
  const { roots } = props;
  if (shouldRenderRootsInReps(roots)) {
    return renderRep(roots[0], props);
  }
  return new OI(props);
};
