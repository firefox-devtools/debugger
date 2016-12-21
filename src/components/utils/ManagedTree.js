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

    const hLightItems = nextProps.hLightItems;
    if (hLightItems &&  hLightItems != this.props.hLightItems &&
       hLightItems.length > 0) {
      this.highlightItem(hLightItems);
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

  highlightItem(hLightItems) {
    const expanded = this.state.expanded;
    let done = false;
    let index = hLightItems.length - 1;
    // Look at folders starting from the top-level until finds a
    // closed folder and highlight this folder
    while(!done && index >= 1) {
      if (!expanded.has(this.props.getKey(hLightItems[index]))) {
        this.focusItem(hLightItems[index]);
        done = true;
      }
      index--;
    }

    // This item's top folders have all been opened, so highlight
    // this file
    if (!done) {
      this.focusItem(hLightItems[0]);
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
