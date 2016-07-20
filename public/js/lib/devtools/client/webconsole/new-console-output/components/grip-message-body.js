/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

// React
const {
  createFactory,
  PropTypes
} = require("devtools/client/shared/vendor/react");
const { createFactories } = require("devtools/client/shared/components/reps/rep-utils");
const { Rep } = createFactories(require("devtools/client/shared/components/reps/rep"));
const VariablesViewLink = createFactory(require("devtools/client/webconsole/new-console-output/components/variables-view-link").VariablesViewLink);
const { Grip } = require("devtools/client/shared/components/reps/grip");

GripMessageBody.displayName = "GripMessageBody";

GripMessageBody.propTypes = {
  grip: PropTypes.object.isRequired,
};

function GripMessageBody(props) {
  return Rep({
    object: props.grip,
    objectLink: VariablesViewLink,
    defaultRep: Grip
  });
}

module.exports.GripMessageBody = GripMessageBody;
