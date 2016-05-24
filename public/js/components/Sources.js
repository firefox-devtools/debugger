"use strict";

const React = require("react");
const { DOM: dom, PropTypes } = React;
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const classnames = require("classnames");
const ImPropTypes = require("react-immutable-proptypes");
const ManagedTree = React.createFactory(require("./util/ManagedTree"));
const { Set } = require("immutable");
const actions = require("../actions");
const { getSelectedSource, getSources } = require("../selectors");
const {
  createNode, nodeHasChildren, createParentMap, addToTree
} = require("../util/sources-tree.js");

require("./Sources.css");

// This is inline because it's much faster. We need to revisit how we
// load SVGs, at least for components that render them several times.
let Arrow = (props) => {
  return dom.span(
    props,
    dom.svg(
      { viewBox: "0 0 16 16" },
      dom.path({ d: "M8 13.4c-.5 0-.9-.2-1.2-.6L.4 5.2C0 4.7-.1 4.3.2 3.7S1 3 1.6 3h12.8c.6 0 1.2.1 1.4.7.3.6.2 1.1-.2 1.6l-6.4 7.6c-.3.4-.7.5-1.2.5z" }) // eslint-disable-line max-len
    )
  );
};
Arrow = React.createFactory(Arrow);

let Folder = (props) => {
  return dom.span(
    props,
    dom.svg(
      { viewBox: "0 -2 16 16" },
      dom.path({ d: "M2 5.193v7.652c0 .003-.002 0 .007 0H14v-7.69c0-.003.002 0-.007 0h-7.53v-2.15c0-.002-.004-.005-.01-.005H2.01C2 3 2 3 2 3.005V5.193zm-1 0V3.005C1 2.45 1.444 2 2.01 2h4.442c.558 0 1.01.45 1.01 1.005v1.15h6.53c.557 0 1.008.44 1.008 1v7.69c0 .553-.45 1-1.007 1H2.007c-.556 0-1.007-.44-1.007-1V5.193zM6.08 4.15H2v1h4.46v-1h-.38z" }) // eslint-disable-line max-len
    )
  );
};
Folder = React.createFactory(Folder);

let Domain = (props) => {
  return dom.span(
    props,
    dom.svg(
      { viewBox: "0 0 16 16" },
      dom.path({ d: "M8.507 5.508L6.53 5.51l-.108.108v1.334l.848.89.455.032.107-.107v-.57l.75-.705.032-.877M11.675 10.81l-1.39-1.347h-1.49l-.52.476-.03 1.022.664.708 1.22.032-.108-.107v1.108l.897.942.29.03.107-.106v-1.067l.39-.345.03-.855-.107.107h.24l.377-.334v-.15l-.116-.115-.53-.03" }), // eslint-disable-line max-len
      dom.path({ d: "M8.47 15.073c-3.088 0-5.6-2.513-5.6-5.602V9.4v-.003c0-.018 0-.018.002-.034l.182-.088.724.587.49.033.497.543-.034.9.317.383h.47l.114.096-.032 1.9.524.553h.105l.025-.338 1.004-.95.054-.474.53-.462v-.888l-.588-.038-1.118-1.155H4.48l-.154-.09V9.01l.155-.1h1.164v-.273l.12-.115.7.033.494-.443.034-.746-.624-.655h-.724v.28l-.11.07H4.64l-.114-.09.025-.64.48-.43v-.244h-.382c-.102 0-.152-.128-.08-.2 1.04-1.01 2.428-1.59 3.903-1.59 1.374 0 2.672.5 3.688 1.39.08.068.03.198-.075.198l-1.144-.034-.81.803.52.523v.16l-.382.388h-.158l-.176-.177v-.16l.076-.074-.252-.252-.37.362.53.53c.072.072.005.194-.096.194l-.752-.005v.844h.783L9.885 8l.16-.143h.16l.62.61v.267l.58.027.003.002V8.76l.18-.03 1.234 1.24.753-.708h.382l.116.108c0 .02.003.016.003.036v.065c0 3.09-2.515 5.603-5.605 5.603M8.47 3C4.904 3 2 5.903 2 9.47c0 3.57 2.903 6.472 6.47 6.472 3.57 0 6.472-2.903 6.472-6.47C14.942 5.9 12.04 3 8.472 3" }) // eslint-disable-line max-len
    )
  );
};
Domain = React.createFactory(Domain);

let File = (props) => {
  return dom.span(
    props,
    dom.svg(
      { viewBox: "0 0 16 16" },
      dom.path({ d: "M4 2v12h9V4.775L9.888 2H4zm0-1h5.888c.246 0 .483.09.666.254l3.112 2.774c.212.19.334.462.334.747V14c0 .552-.448 1-1 1H4c-.552 0-1-.448-1-1V2c0-.552.448-1 1-1z" }), // eslint-disable-line max-len
      dom.path({ d: "M9 1.5v4c0 .325.306.564.62.485l4-1c.27-.067.432-.338.365-.606-.067-.27-.338-.432-.606-.365l-4 1L10 5.5v-4c0-.276-.224-.5-.5-.5s-.5.224-.5.5z" }) // eslint-disable-line max-len
    )
  );
};
File = React.createFactory(File);

let Worker = (props) => {
  return dom.span(
    props,
    dom.svg(
      { viewBox: "0 0 16 16" },
      dom.path({ d: "M8.5 8.793L5.854 6.146l-.04-.035L7.5 4.426c.2-.2.3-.4.3-.6 0-.2-.1-.4-.2-.6l-1-1c-.4-.3-.9-.3-1.2 0l-4.1 4.1c-.2.2-.3.4-.3.6 0 .2.1.4.2.6l1 1c.3.3.9.3 1.2 0l1.71-1.71.036.04L7.793 9.5l-3.647 3.646c-.195.196-.195.512 0 .708.196.195.512.195.708 0L8.5 10.207l3.646 3.647c.196.195.512.195.708 0 .195-.196.195-.512 0-.708L9.207 9.5l2.565-2.565L13.3 8.5c.1.1 2.3 1.1 2.7.7.4-.4-.3-2.7-.5-2.9l-1.1-1.1c.1-.1.2-.4.2-.6 0-.2-.1-.4-.2-.6l-.4-.4c-.3-.3-.8-.3-1.1 0l-1.5-1.4c-.2-.2-.3-.2-.5-.2s-.3.1-.5.2L9.2 3.4c-.2.1-.2.2-.2.4s.1.4.2.5l1.874 1.92L8.5 8.792z" }) // eslint-disable-line max-len
    )
  );
};
Worker = React.createFactory(Worker);

let SourcesTree = React.createClass({
  propTypes: {
    sources: ImPropTypes.map.isRequired,
    selectSource: PropTypes.func.isRequired
  },

  displayName: "SourcesTree",

  makeInitialState(props) {
    const tree = createNode("root", "", []);
    for (let source of props.sources.valueSeq()) {
      addToTree(tree, source);
    }

    return { sourceTree: tree,
             parentMap: createParentMap(tree),
             focusedItem: null };
  },

  getInitialState() {
    return this.makeInitialState(this.props);
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.sources !== this.props.sources) {
      if (nextProps.sources.size === 0) {
        this.setState(this.makeInitialState(nextProps));
        return;
      }

      const next = Set(nextProps.sources.valueSeq());
      const prev = Set(this.props.sources.valueSeq());
      const newSet = next.subtract(prev);

      const tree = this.state.sourceTree;
      for (let source of newSet) {
        addToTree(tree, source);
      }

      this.setState({ sourceTree: tree,
                      parentMap: createParentMap(tree) });
    }
  },

  focusItem(item) {
    this.setState({ focusedItem: item });
  },

  selectItem(item) {
    if (!nodeHasChildren(item)) {
      this.props.selectSource(item.contents.toJS());
    }
  },

  renderItem(item, depth, focused, _, expanded, { setExpanded }) {
    const arrow = Arrow({
      className: classnames(
        "arrow", 
        { expanded: expanded,
          hidden: !nodeHasChildren(item) }
      ),
      onClick: e => {
        e.stopPropagation();
        setExpanded(item, !expanded);
      }
    });

    const folder = Folder({
      className: classnames(
        "folder"
      )
    });

    const domain = Domain({
      className: classnames(
        "domain"
      )
    });

    const file = File({
      className: classnames(
        "file"
      )
    });

    const worker = Worker({
      className: classnames(
        "worker"
      )
    });

    let icon = worker;

    if (depth === 0) {
      icon = domain;
    } else if (!nodeHasChildren(item)) {
      icon = file;
    } else {
      icon = folder;
    }

    return dom.div(
      { className: classnames("node", { focused }),
        style: { marginLeft: depth * 15 + "px" },
        onClick: () => this.selectItem(item),
        onDoubleClick: e => {
          setExpanded(item, !expanded);
        } },
      arrow,
      icon,
      item.name
    );
  },

  render() {
    const { focusedItem, sourceTree, parentMap } = this.state;

    const tree = ManagedTree({
      getParent: item => {
        return parentMap.get(item);
      },
      getChildren: item => {
        if (nodeHasChildren(item)) {
          return item.contents;
        }
        return [];
      },
      getRoots: () => sourceTree.contents,
      getKey: (item, i) => item.path,
      itemHeight: 30,
      autoExpandDepth: 2,
      onFocus: this.focusItem,
      renderItem: this.renderItem
    });

    return dom.div({
      className: "sources-list",
      onKeyDown: e => {
        if (e.keyCode === 13 && focusedItem) {
          this.selectItem(focusedItem);
        }
      }
    }, tree);
  }
});
SourcesTree = React.createFactory(SourcesTree);

function Sources({ sources, selectSource, selectedSource }) {
  return dom.div(
    { className: "sources-panel" },
    dom.div({ className: "sources-header" }),
    SourcesTree({ sources, selectSource })
  );
}

module.exports = connect(
  state => ({ selectedSource: getSelectedSource(state),
              sources: getSources(state) }),
  dispatch => bindActionCreators(actions, dispatch)
)(Sources);
