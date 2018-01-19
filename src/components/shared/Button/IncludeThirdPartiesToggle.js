/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow
import React, { PureComponent } from "react";
import Svg from "../Svg";

type Props = {
  includeThirdParties: boolean,
  toggleIncludeThirdParties: () => void
};

class IncludeThirdPartiesToggle extends PureComponent<Props> {
  render() {
    const { includeThirdParties, toggleIncludeThirdParties } = this.props;
    const title = includeThirdParties
      ? L10N.getStr("sourceSearch.includeThirdPartiesToggle.includeTooltip")
      : L10N.getStr("sourceSearch.includeThirdPartiesToggle.excludeTooltip");
    const icon = includeThirdParties ? "arrow-up" : "arrow-down";

    return (
      <button onClick={toggleIncludeThirdParties} title={title}>
        <Svg name={icon} />
      </button>
    );
  }
}

export default IncludeThirdPartiesToggle;
