const React = require("react");
const Tree = React.createFactory(require("../../lib/tree"));

let ManagedTree = React.createClass({
  getInitialState() {
    return { expanded: new WeakMap(),
             focusedItem: null };
  },

  // componentWillReceiveProps() {
  //   this.setState({ expanded: new WeakMap(),
  //                   focusedItem: null });
  // },

  setExpanded(item, expanded) {
    const e = this.state.expanded;
    e.set(item, expanded);
    this.setState({ expanded: e });

    if(expanded && this.props.onExpand) {
      this.props.onExpand(item);
    }
    else if(!expanded && this.props.onCollapse) {
      this.props.onCollapse(item);
    }
  },

  focusItem(item) {
    if(this.state.focused !== item) {
      this.setState({ focusedItem: item });

      if(this.props.onFocus) {
        this.props.onFocus(item);
      }
    }
  },

  render() {
    const { expanded, focusedItem } = this.state;

    const props = Object.assign({}, this.props, {
      isExpanded: item => {
        // console.log(item, expanded.get(item));
        return expanded.get(item);
      },
      focused: focusedItem,

      onExpand: item => this.setExpanded(item, true),
      onCollapse: item => this.setExpanded(item, false),
      onFocus: this.focusItem,

      renderItem: (...args) => {
        return this.props.renderItem(...args, {
          setExpanded: this.setExpanded
        })
      }
    });

    return Tree(props);
  }
});

module.exports = ManagedTree;
