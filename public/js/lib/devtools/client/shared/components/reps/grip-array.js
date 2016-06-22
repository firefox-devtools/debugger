/* -*- indent-tabs-mode: nil; js-indent-level: 2 -*- */
/* vim: set ft=javascript ts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

// Make this available to both AMD and CJS environments
define(function(require, exports, module) {
  // Dependencies
  const React = require("devtools/client/shared/vendor/react");
  const { createFactories, isGrip } = require("./rep-utils");
  const { ObjectBox } = createFactories(require("./object-box"));
  const { Caption } = createFactories(require("./caption"));

  // Shortcuts
  const { a, span } = React.DOM;

  /**
   * Renders an array. The array is enclosed by left and right bracket
   * and the max number of rendered items depends on the current mode.
   */
  let GripArray = React.createClass({
    propTypes: {
      object: React.PropTypes.object.isRequired,
      mode: React.PropTypes.string,
      provider: React.PropTypes.object,
    },

    displayName: "GripArray",

    getLength: function(grip) {
      return grip.preview ? grip.preview.length : 0;
    },

    getTitle: function(object, context) {
      return "[" + object.length + "]";
    },

    arrayIterator: function(grip, max) {
      let items = [];

      if (!grip.preview || !grip.preview.length) {
        return items;
      }

      let array = grip.preview.items;
      if (!array) {
        return items;
      }

      let provider = this.props.provider;
      if (!provider) {
        return items;
      }

      let delim;

      for (let i = 0; i < array.length && i <= max; i++) {
        try {
          let value = provider.getValue(array[i]);

          delim = (i == array.length - 1 ? "" : ", ");

          if (value === array) {
            items.push(Reference({
              key: i,
              object: value,
              delim: delim}
            ));
          } else {
            items.push(GripArrayItem(Object.assign({}, this.props, {
              key: i,
              object: value,
              delim: delim}
            )));
          }
        } catch (exc) {
          items.push(GripArrayItem(Object.assign({}, this.props, {
            object: exc,
            delim: delim,
            key: i}
          )));
        }
      }

      if (array.length > max + 1) {
        items.pop();
        items.push(Caption({
          key: "more",
          object: "more..."}
        ));
      }

      return items;
    },

    hasSpecialProperties: function(array) {
      return false;
    },

    // Event Handlers

    onToggleProperties: function(event) {
    },

    onClickBracket: function(event) {
    },

    render: function() {
      let mode = this.props.mode || "short";
      let object = this.props.object;

      let items;

      if (mode == "tiny") {
        items = span({className: "length"}, this.getLength(object));
      } else {
        let max = (mode == "short") ? 3 : 300;
        items = this.arrayIterator(object, max);
      }

      return (
        ObjectBox({
          className: "array",
          onClick: this.onToggleProperties},
          a({
            className: "objectLink",
            onclick: this.onClickBracket},
            span({
              className: "arrayLeftBracket",
              role: "presentation"},
              "["
            )
          ),
          items,
          a({
            className: "objectLink",
            onclick: this.onClickBracket},
            span({
              className: "arrayRightBracket",
              role: "presentation"},
              "]"
            )
          ),
          span({
            className: "arrayProperties",
            role: "group"}
          )
        )
      );
    },
  });

  /**
   * Renders array item. Individual values are separated by
   * a delimiter (a comma by default).
   */
  let GripArrayItem = React.createFactory(React.createClass({
    propTypes: {
      delim: React.PropTypes.string,
    },

    displayName: "GripArrayItem",

    render: function() {
      let { Rep } = createFactories(require("./rep"));

      return (
        span({},
          Rep(Object.assign({}, this.props, {
            mode: "tiny"
          })),
          this.props.delim
        )
      );
    }
  }));

  /**
   * Renders cycle references in an array.
   */
  let Reference = React.createFactory(React.createClass({
    displayName: "Reference",

    render: function() {
      return (
        span({title: "Circular reference"},
          "[...]"
        )
      );
    }
  }));

  function supportsObject(grip, type) {
    if (!isGrip(grip)) {
      return false;
    }

    return (grip.preview && grip.preview.kind == "ArrayLike");
  }

  // Exports from this module
  exports.GripArray = {
    rep: GripArray,
    supportsObject: supportsObject
  };
});
