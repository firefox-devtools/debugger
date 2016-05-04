"use strict";

const React = require("react");
const { DOM: dom, createElement } = React;

const { storiesOf } = require("@kadira/storybook");

const Tree = React.createFactory(require("../../lib/tree"));
require("./s.css");

const T = React.createClass({
  getInitialState: function() {
    return { expanded: new WeakMap() };
  },

  setExpanded: function(item, expanded) {
    const e = this.state.expanded;
    e.set(item, expanded);
    this.setState({ expanded: e });
  },

  render: function() {
    const { tree, parentMap } = this.props;
    const { expanded } = this.state;

    return dom.div(
      null,
      Tree({
        getParent: item => parentMap.get(item),
        getChildren: item => item.children || [],
        getRoots: () => ([ tree ]),
        getKey: item => item.prop,
        isExpanded: item => expanded.get(item),
        itemHeight: 20,
        height: 300,
        width: 300,
        autoExpandDepth: 10,
        renderItem: (item, depth, focused, arrow) => {
          return dom.div({ style: { marginLeft: depth * 20 + "px",
                                    height: 20 }},
                         arrow,
                         item.prop);
        },

        onExpand: item => this.setExpanded(item, true),
        onCollapse: item => this.setExpanded(item, false)
      })
    );
  }
});

function createParentMap(tree) {
  var map = new Map();

  function _traverse(parent) {
    if(parent.children) {
      parent.children.forEach(child => {
        map.set(child, parent);
        _traverse(child);
      });
    }
  }

  _traverse(tree);
  return map;
}

let data = {
  prop: "foo",
  value: 3,
  children: [
    { prop: "bar",
      value: 4 },
    { prop: "baz",
      value: 5 },
    { prop: "bzz",
      value: 6 },
    { prop: "buz",
      value: 7 },
    { prop: "bar",
      value: 4 },
    { prop: "baz",
      value: 5 },
    { prop: "bzz",
      value: 6 },
    { prop: "buz",
      value: 7 },
    { prop: "bar",
      value: 4 },
    { prop: "baz",
      value: 5 },
    { prop: "bzz",
      value: 6 },
    { prop: "buz",
      value: 7 },
    { prop: "bar",
      value: 4 },
    { prop: "baz",
      value: 5 },
    { prop: "bzz",
      value: 6 },
    { prop: "buz",
      value: 7 },

    { prop: "biz",
      value: 8,
      children: [
        { prop: "hi", value: 10 }
      ]
    },
  ]
}

let parentMap = createParentMap(data);

storiesOf("Tree", module)
  .add("basic", () => {
    return React.createElement(T, { tree: data, parentMap: parentMap });
  });
