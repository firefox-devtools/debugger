/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import PropTypes from "prop-types";
import React, { Component } from "react";
import classnames from "classnames";

import { connect } from "react-redux";
import { getSourceMetaData } from "../../selectors";
import { getSourceClassnames } from "../../utils/source";

import type Source from "../../types";

type Props = {
  source: Source,
  metaData: Object
};

class SecondaryPanes extends Component<Props> {
  render() {
    const { source, metaData } = this.props;
    return (
      <img
        className={classnames(
          "source-icon",
          getSourceClassnames(source, metaData)
        )}
      />
    );
  }
}

SecondaryPanes.contextTypes = {
  shortcuts: PropTypes.object
};

export default connect((state, props) => {
  return {
    metaData: getSourceMetaData(state, props.source)
  };
})(SecondaryPanes);
