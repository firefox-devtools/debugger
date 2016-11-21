/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

const { DOM: dom, createClass, createFactory, PropTypes } = require("react");
// const { ViewHelpers } =
// require("resource://devtools/client/shared/widgets/ViewHelpers.jsm");
// let { VirtualScroll } = require("react-virtualized");
// VirtualScroll = createFactory(VirtualScroll);

const AUTO_EXPAND_DEPTH = 0; // depth

/**
 * An arrow that displays whether its node is expanded (▼) or collapsed
 * (▶). When its node has no children, it is hidden.
 */
const ArrowExpander = createFactory(createClass({
  displayName: "ArrowExpander",

  shouldComponentUpdate(nextProps, nextState) {
    return this.props.item !== nextProps.item
      || this.props.visible !== nextProps.visible
      || this.props.expanded !== nextProps.expanded;
  },

  render() {
    const attrs = {
      className: "arrow theme-twisty",
      onClick: this.props.expanded
        ? () => this.props.onCollapse(this.props.item)
        : e => this.props.onExpand(this.props.item, e.altKey)
    };

    if (this.props.expanded) {
      attrs.className += " open";
    }

    if (!this.props.visible) {
      attrs.style = Object.assign({}, this.props.style || {}, {
        visibility: "hidden"
      });
    }

    return dom.div(attrs, this.props.children);
  }
}));

const TreeNode = createFactory(createClass({
  displayName: "TreeNode",

  componentDidMount() {
    if (this.props.focused) {
      this.refs.button.focus();
    }
  },

  componentDidUpdate() {
    if (this.props.focused) {
      this.refs.button.focus();
    }
  },

  shouldComponentUpdate(nextProps) {
    return this.props.item !== nextProps.item ||
      this.props.focused !== nextProps.focused ||
      this.props.expanded !== nextProps.expanded;
  },

  render() {
    const arrow = ArrowExpander({
      item: this.props.item,
      expanded: this.props.expanded,
      visible: this.props.hasChildren,
      onExpand: this.props.onExpand,
      onCollapse: this.props.onCollapse,
    });

    let isOddRow = this.props.index % 2;
    return dom.div(
      {
        className: `tree-node div ${isOddRow ? "tree-node-odd" : ""}`,
        onFocus: this.props.onFocus,
        onClick: this.props.onFocus,
        onBlur: this.props.onBlur,
        style: {
          padding: 0,
          margin: 0
        }
      },

      this.props.renderItem(this.props.item,
                            this.props.depth,
                            this.props.focused,
                            arrow,
                            this.props.expanded),

      // XXX: OSX won't focus/blur regular elements even if you set tabindex
      // unless there is an input/button child.
      dom.button(this._buttonAttrs)
    );
  },

  _buttonAttrs: {
    ref: "button",
    style: {
      opacity: 0,
      width: "0 !important",
      height: "0 !important",
      padding: "0 !important",
      outline: "none",
      MozAppearance: "none",
      // XXX: Despite resetting all of the above properties (and margin), the
      // button still ends up with ~79px width, so we set a large negative
      // margin to completely hide it.
      MozMarginStart: "-1000px !important",
    }
  }
}));

/**
 * Create a function that calls the given function `fn` only once per animation
 * frame.
 *
 * @param {Function} fn
 * @returns {Function}
 */
function oncePerAnimationFrame(fn) {
  let animationId = null;
  let argsToPass = null;
  return function(...args) {
    argsToPass = args;
    if (animationId !== null) {
      return;
    }

    animationId = requestAnimationFrame(() => {
      fn.call(this, ...argsToPass);
      animationId = null;
      argsToPass = null;
    });
  };
}

const NUMBER_OF_OFFSCREEN_ITEMS = 1;

/**
 * A generic tree component. See propTypes for the public API.
 *
 * @see `devtools/client/memory/components/test/mochitest/head.js` for usage
 * @see `devtools/client/memory/components/heap.js` for usage
 */
const Tree = module.exports = createClass({
  displayName: "Tree",

  propTypes: {
    // Required props

    // A function to get an item's parent, or null if it is a root.
    getParent: PropTypes.func.isRequired,
    // A function to get an item's children.
    getChildren: PropTypes.func.isRequired,
    // A function which takes an item and ArrowExpander and returns a
    // component.
    renderItem: PropTypes.func.isRequired,
    // A function which returns the roots of the tree (forest).
    getRoots: PropTypes.func.isRequired,
    // A function to get a unique key for the given item.
    getKey: PropTypes.func.isRequired,
    // A function to get whether an item is expanded or not. If an item is not
    // expanded, then it must be collapsed.
    isExpanded: PropTypes.func.isRequired,
    // The height of an item in the tree including margin and padding, in
    // pixels.
    itemHeight: PropTypes.number.isRequired,

    // Optional props

    // The currently focused item, if any such item exists.
    focused: PropTypes.any,
    // Handle when a new item is focused.
    onFocus: PropTypes.func,
    // The depth to which we should automatically expand new items.
    autoExpandDepth: PropTypes.number,
    // Should auto expand all new items or just the new items under the first
    // root item.
    autoExpandAll: PropTypes.bool,
    // Optional event handlers for when items are expanded or collapsed.
    onExpand: PropTypes.func,
    onCollapse: PropTypes.func,
  },

  getDefaultProps() {
    return {
      autoExpandDepth: AUTO_EXPAND_DEPTH,
      autoExpandAll: true
    };
  },

  getInitialState() {
    return {
      scroll: 0,
      height: window.innerHeight,
      seen: new Set(),
    };
  },

  componentDidMount() {
    window.addEventListener("resize", this._updateHeight);
    this._autoExpand(this.props);
    this._updateHeight();
  },

  componentWillUnmount() {
    window.removeEventListener("resize", this._updateHeight);
  },

  componentWillReceiveProps(nextProps) {
    this._autoExpand(nextProps);
    this._updateHeight();
  },

  _autoExpand(props) {
    if (!props.autoExpandDepth) {
      return;
    }

    // Automatically expand the first autoExpandDepth levels for new items. Do
    // not use the usual DFS infrastructure because we don't want to ignore
    // collapsed nodes.
    const autoExpand = (item, currentDepth) => {
      if (currentDepth >= props.autoExpandDepth ||
          this.state.seen.has(item)) {
        return;
      }

      props.onExpand(item);
      this.state.seen.add(item);

      const children = props.getChildren(item);
      const length = children.length;
      for (let i = 0; i < length; i++) {
        autoExpand(children[i], currentDepth + 1);
      }
    };

    const roots = props.getRoots();
    const length = roots.length;
    if (props.autoExpandAll) {
      for (let i = 0; i < length; i++) {
        autoExpand(roots[i], 0);
      }
    } else {
      autoExpand(roots[0], 0);
    }
  },

  render() {
    const traversal = this._dfsFromRoots();

    // Remove `NUMBER_OF_OFFSCREEN_ITEMS` from `begin` and add `2 *
    // NUMBER_OF_OFFSCREEN_ITEMS` to `end` so that the top and bottom of the
    // page are filled with the `NUMBER_OF_OFFSCREEN_ITEMS` previous and next
    // items respectively, rather than whitespace if the item is not in full
    // view.
    // const begin = Math.max(((this.state.scroll / this.props.itemHeight) | 0) - NUMBER_OF_OFFSCREEN_ITEMS, 0);
    // const end = begin + (2 * NUMBER_OF_OFFSCREEN_ITEMS) + ((this.state.height / this.props.itemHeight) | 0);
    // const toRender = traversal;

    // const nodes = [
    //   dom.div({
    //     key: "top-spacer",
    //     style: {
    //       padding: 0,
    //       margin: 0,
    //       height: begin * this.props.itemHeight + "px"
    //     }
    //   })
    // ];

    const renderItem = i => {
      let { item, depth } = traversal[i];
      return TreeNode({
        key: this.props.getKey(item, i),
        index: i,
        item: item,
        depth: depth,
        renderItem: this.props.renderItem,
        focused: this.props.focused === item,
        expanded: this.props.isExpanded(item),
        hasChildren: !!this.props.getChildren(item).length,
        onExpand: this._onExpand,
        onCollapse: this._onCollapse,
        onFocus: () => this._focus(i, item),
      });
    };

    // nodes.push(dom.div({
    //   key: "bottom-spacer",
    //   style: {
    //     padding: 0,
    //     margin: 0,
    //     height: (traversal.length - 1 - end) * this.props.itemHeight + "px"
    //   }
    // }));

    const style = Object.assign({}, this.props.style || {}, {
      padding: 0,
      margin: 0
    });

    return dom.div(
      {
        className: "tree",
        ref: "tree",
        onKeyDown: this._onKeyDown,
        onKeyPress: this._preventArrowKeyScrolling,
        onKeyUp: this._preventArrowKeyScrolling,
        // onScroll: this._onScroll,
        style
      },
      // VirtualScroll({
      //   width: this.props.width,
      //   height: this.props.height,
      //   rowsCount: traversal.length,
      //   rowHeight: this.props.itemHeight,
      //   rowRenderer: renderItem
      // })
      traversal.map((v, i) => renderItem(i))
    );
  },

  _preventArrowKeyScrolling(e) {
    switch (e.key) {
      case "ArrowUp":
      case "ArrowDown":
      case "ArrowLeft":
      case "ArrowRight":
        e.preventDefault();
        e.stopPropagation();
        if (e.nativeEvent) {
          if (e.nativeEvent.preventDefault) {
            e.nativeEvent.preventDefault();
          }
          if (e.nativeEvent.stopPropagation) {
            e.nativeEvent.stopPropagation();
          }
        }
    }
  },

  /**
   * Updates the state's height based on clientHeight.
   */
  _updateHeight() {
    this.setState({
      height: this.refs.tree.clientHeight
    });
  },

  /**
   * Perform a pre-order depth-first search from item.
   */
  _dfs(item, maxDepth = Infinity, traversal = [], _depth = 0) {
    traversal.push({ item, depth: _depth });

    if (!this.props.isExpanded(item)) {
      return traversal;
    }

    const nextDepth = _depth + 1;

    if (nextDepth > maxDepth) {
      return traversal;
    }

    const children = this.props.getChildren(item);
    const length = children.length;
    for (let i = 0; i < length; i++) {
      this._dfs(children[i], maxDepth, traversal, nextDepth);
    }

    return traversal;
  },

  /**
   * Perform a pre-order depth-first search over the whole forest.
   */
  _dfsFromRoots(maxDepth = Infinity) {
    const traversal = [];

    const roots = this.props.getRoots();
    const length = roots.length;
    for (let i = 0; i < length; i++) {
      this._dfs(roots[i], maxDepth, traversal);
    }

    return traversal;
  },

  /**
   * Expands current row.
   *
   * @param {Object} item
   * @param {Boolean} expandAllChildren
   */
  _onExpand: oncePerAnimationFrame(function(item, expandAllChildren) {
    if (this.props.onExpand) {
      this.props.onExpand(item);

      if (expandAllChildren) {
        const children = this._dfs(item);
        const length = children.length;
        for (let i = 0; i < length; i++) {
          this.props.onExpand(children[i].item);
        }
      }
    }
  }),

  /**
   * Collapses current row.
   *
   * @param {Object} item
   */
  _onCollapse: oncePerAnimationFrame(function(item) {
    if (this.props.onCollapse) {
      this.props.onCollapse(item);
    }
  }),

  /**
   * Sets the passed in item to be the focused item.
   *
   * @param {Number} index
   *        The index of the item in a full DFS traversal (ignoring collapsed
   *        nodes). Ignored if `item` is undefined.
   *
   * @param {Object|undefined} item
   *        The item to be focused, or undefined to focus no item.
   */
  _focus(index, item) {
    if (item !== undefined) {
      const itemStartPosition = index * this.props.itemHeight;
      const itemEndPosition = (index + 1) * this.props.itemHeight;

      // Note that if the height of the viewport (this.state.height) is less than
      // `this.props.itemHeight`, we could accidentally try and scroll both up and
      // down in a futile attempt to make both the item's start and end positions
      // visible. Instead, give priority to the start of the item by checking its
      // position first, and then using an "else if", rather than a separate "if",
      // for the end position.
      if (this.state.scroll > itemStartPosition) {
        this.refs.tree.scrollTop = itemStartPosition;
      } else if ((this.state.scroll + this.state.height) < itemEndPosition) {
        this.refs.tree.scrollTop = itemEndPosition - this.state.height;
      }
    }

    if (this.props.onFocus) {
      this.props.onFocus(item);
    }
  },

  /**
   * Sets the state to have no focused item.
   */
  _onBlur() {
    this._focus(0, undefined);
  },

  /**
   * Fired on a scroll within the tree's container, updates
   * the stored position of the view port to handle virtual view rendering.
   *
   * @param {Event} e
   */
  _onScroll: oncePerAnimationFrame(function(e) {
    this.setState({
      scroll: Math.max(this.refs.tree.scrollTop, 0),
      height: this.refs.tree.clientHeight
    });
  }),

  /**
   * Handles key down events in the tree's container.
   *
   * @param {Event} e
   */
  _onKeyDown(e) {
    if (this.props.focused == null) {
      return;
    }

    // Allow parent nodes to use navigation arrows with modifiers.
    if (e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) {
      return;
    }

    this._preventArrowKeyScrolling(e);

    switch (e.key) {
      case "ArrowUp":
        this._focusPrevNode();
        return;

      case "ArrowDown":
        this._focusNextNode();
        return;

      case "ArrowLeft":
        if (this.props.isExpanded(this.props.focused)
            && this.props.getChildren(this.props.focused).length) {
          this._onCollapse(this.props.focused);
        } else {
          this._focusParentNode();
        }
        return;

      case "ArrowRight":
        if (!this.props.isExpanded(this.props.focused)) {
          this._onExpand(this.props.focused);
        } else {
          this._focusNextNode();
        }
        return;
    }
  },

  /**
   * Sets the previous node relative to the currently focused item, to focused.
   */
  _focusPrevNode: oncePerAnimationFrame(function() {
    // Start a depth first search and keep going until we reach the currently
    // focused node. Focus the previous node in the DFS, if it exists. If it
    // doesn't exist, we're at the first node already.

    let prev;
    let prevIndex;

    const traversal = this._dfsFromRoots();
    const length = traversal.length;
    for (let i = 0; i < length; i++) {
      const item = traversal[i].item;
      if (item === this.props.focused) {
        break;
      }
      prev = item;
      prevIndex = i;
    }

    if (prev === undefined) {
      return;
    }

    this._focus(prevIndex, prev);
  }),

  /**
   * Handles the down arrow key which will focus either the next child
   * or sibling row.
   */
  _focusNextNode: oncePerAnimationFrame(function() {
    // Start a depth first search and keep going until we reach the currently
    // focused node. Focus the next node in the DFS, if it exists. If it
    // doesn't exist, we're at the last node already.

    const traversal = this._dfsFromRoots();
    const length = traversal.length;
    let i = 0;

    while (i < length) {
      if (traversal[i].item === this.props.focused) {
        break;
      }
      i++;
    }

    if (i + 1 < traversal.length) {
      this._focus(i + 1, traversal[i + 1].item);
    }
  }),

  /**
   * Handles the left arrow key, going back up to the current rows'
   * parent row.
   */
  _focusParentNode: oncePerAnimationFrame(function() {
    const parent = this.props.getParent(this.props.focused);
    if (!parent) {
      return;
    }

    const traversal = this._dfsFromRoots();
    const length = traversal.length;
    let parentIndex = 0;
    for (; parentIndex < length; parentIndex++) {
      if (traversal[parentIndex].item === parent) {
        break;
      }
    }

    this._focus(parentIndex, parent);
  }),
});
