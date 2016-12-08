const React = require("react");
const Tree = React.createFactory(require("devtools-sham-modules").Tree);
require("./ManagedTree.css");

let ManagedTree = React.createClass({
  propTypes: Tree.propTypes,

  displayName: "ManagedTree",

  getInitialState() {
    return {
      expanded: new Set(),
      focusedItem: null,
      listItems: []
    };
  },

  componentWillReceiveProps(nextProps) {
    this.setState({ listItems: nextProps.itemsList });
  },

  componentDidUpdate(nextProps) {
    const listItemsLocal = this.state.listItems;
    if(listItemsLocal && listItemsLocal.length > 0) {
      if(listItemsLocal.length == 1) {
        this.setState({ focusedItem: listItemsLocal[0] });
      }
      else {
        this.expandListItems(listItemsLocal, true);
      }
      listItemsLocal.splice(0, 1);
      this.setState({ listItems: listItemsLocal });
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

  expandListItems(itemsList) {
    const key = this.props.getKey(itemsList[0]);
    const expanded = this.state.expanded;
    expanded.add(key);
    this.setState({ expanded: expanded });
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
      onExpandListItems: itemsList => this.expandListItems(itemsList),

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
