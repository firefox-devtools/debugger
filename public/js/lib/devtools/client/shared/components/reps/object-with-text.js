/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

// Make this available to both AMD and CJS environments
define(function(require, exports, module) {
  // ReactJS
  const React = require("devtools/client/shared/vendor/react");

  // Reps
  const { createFactories, isGrip } = require("./rep-utils");
  const { ObjectLink } = createFactories(require("./object-link"));

  // Shortcuts
  const { span } = React.DOM;

  /**
   * Renders a grip object with textual data.
   */
  let ObjectWithText = React.createClass({
    propTypes: {
      object: React.PropTypes.object.isRequired,
    },

    displayName: "ObjectWithText",

    getType: function(grip) {
      return grip.class;
    },

    getDescription: function(grip) {
      return (grip.preview.kind == "ObjectWithText") ? grip.preview.text : "";
    },

    render: function() {
      let grip = this.props.object;
      return (
        ObjectLink({className: this.getType(grip)},
          span({className: "objectPropValue"},
            this.getDescription(grip)
          )
        )
      );
    },
  });

  // Registration

  function supportsObject(grip, type) {
    if (!isGrip(grip)) {
      return false;
    }

    return (grip.preview && grip.preview.kind == "ObjectWithText");
  }

  // Exports from this module
  exports.ObjectWithText = {
    rep: ObjectWithText,
    supportsObject: supportsObject
  };
});
