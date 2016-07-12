/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

// Make this available to both AMD and CJS environments
define(function (require, exports, module) {
  // ReactJS
  const React = require("devtools/client/shared/vendor/react");

  // Reps
  const { createFactories, isGrip } = require("./rep-utils");
  const { ObjectLink } = createFactories(require("./object-link"));

  // Shortcuts
  const { span } = React.DOM;

  /**
   * Used to render JS built-in Date() object.
   */
  let DateTime = React.createClass({
    displayName: "Date",

    propTypes: {
      object: React.PropTypes.object.isRequired
    },

    getTitle: function (grip) {
      return new Date(grip.preview.timestamp).toISOString();
    },

    render: function () {
      let grip = this.props.object;
      return (
        ObjectLink({className: "Date"},
          span({className: "objectTitle"},
            this.getTitle(grip)
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

    return (type == "Date" && grip.preview);
  }

  // Exports from this module
  exports.DateTime = {
    rep: DateTime,
    supportsObject: supportsObject
  };
});
