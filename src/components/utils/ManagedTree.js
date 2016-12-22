const React = require("react");
const Tree = React.createFactory(require("devtools-sham-modules").Tree);
require("./ManagedTree.css");

let ManagedTree = React.createClass({
  propTypes: Tree.propTypes,

  displayName: "ManagedTree",

  getInitialState() {
    return {
      expanded: new Set(),
      focusedItem: null
    };
  },

  componentWillReceiveProps(nextProps) {
    const listItems = nextProps.listItems;
    if (listItems &&  listItems != this.props.listItems &&
       listItems.length > 0) {
      this.expandListItems(listItems);
    }

    const highlightItems = nextProps.highlightItems;
    if (highlightItems &&  highlightItems != this.props.highlightItems &&
       highlightItems.length > 0) {
      this.highlightItem(highlightItems);
    }
  },

  setExpanded(item, isExpanded) {
    const expanded = this.state.expanded;
    const key = this.props.getKey(item);
    if (isExpanded) {
      expanded.add(key);
    } else {
      expanded.delete(key);
    }
    this.setState({ expanded });

    if (isExpanded && this.props.onExpand) {
      this.props.onExpand(item);
    } else if (!expanded && this.props.onCollapse) {
      this.props.onCollapse(item);
    }
  },

  expandListItems(listItems) {
    const expanded = this.state.expanded;
    listItems.forEach(item => expanded.add(this.props.getKey(item)));
    this.focusItem(listItems[0]);
    this.setState({ expanded: expanded });
  },

  highlightItem(highlightItems) {
    const expanded = this.state.expanded;

    // This file is visible, so we highlight it.
    if (expanded.has(this.props.getKey(highlightItems[0]))) {
      this.focusItem(highlightItems[0]);
    } else {
      let index = highlightItems.length - 1;

      // Look at folders starting from the top-level until finds a
      // closed folder and highlights this folder
      highlightItems.some(item => {
        if (!expanded.has(this.props.getKey(highlightItems[index]))) {
          this.focusItem(highlightItems[index]);
          return true;
        }
        index--;
      });

    }
  },

  focusItem(item) {
    if (!this.props.disabledFocus && this.state.focusedItem !== item) {
      this.setState({ focusedItem: item });

      if (this.props.onFocus) {
        this.props.onFocus(item);
      }
    }
  },

  render() {
    const { expanded, focusedItem } = this.state;

    const props = Object.assign({}, this.props, {
      isExpanded: item => expanded.has(this.props.getKey(item)),
      focused: focusedItem,

      onExpand: item => this.setExpanded(item, true),
      onCollapse: item => this.setExpanded(item, false),
      onFocus: this.focusItem,

      renderItem: (...args) => {
        return this.props.renderItem(...args, {
          setExpanded: this.setExpanded
        });
      }
    });

    return Tree(props);
  }
});

module.exports = ManagedTree;
