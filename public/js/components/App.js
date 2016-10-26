const React = require("react");
const { DOM: dom, PropTypes, createFactory } = React;
const { connect } = require("react-redux");
const { bindActionCreators } = require("redux");
const { cmdString } = require("../utils/text");
const actions = require("../actions");
const { getSources, getSelectedSource } = require("../selectors");

const { KeyShortcuts } = require("devtools-sham-modules");
const shortcuts = new KeyShortcuts({ window });

require("./App.css");
require("./SplitBox.css");
require("./reps.css");
let { SplitBox } = require("devtools-modules");
SplitBox = createFactory(SplitBox);

const SourceSearch = createFactory(require("./SourceSearch"));
const Sources = createFactory(require("./Sources"));
const Editor = createFactory(require("./Editor"));
const RightSidebar = createFactory(require("./RightSidebar"));
const SourceTabs = createFactory(require("./SourceTabs"));

const App = React.createClass({
  propTypes: {
    sources: PropTypes.object,
    selectSource: PropTypes.func,
    selectedSource: PropTypes.object,
  },

  displayName: "App",

  getChildContext() {
    return { shortcuts };
  },

  renderWelcomeBox() {
    return dom.div(
      { className: "welcomebox" },
      `${cmdString()}+P to search for files`
    );
  },

  renderCenterPane() {
    return dom.div(
      { className: "center-pane" },
      dom.div(
        { className: "editor-container" },
        SourceTabs(),
        Editor(),
        !this.props.selectedSource ? this.renderWelcomeBox() : null,
        SourceSearch()
      )
    );
  },

  render: function() {
    return dom.div(
      { className: "debugger" },
      SplitBox({
        style: { width: "100vw" },
        initialSize: "300px",
        minSize: 10,
        maxSize: "50%",
        splitterSize: 1,
        startPanel: Sources({ sources: this.props.sources }),
        endPanel: SplitBox({
          initialSize: "300px",
          minSize: 10,
          maxSize: "80%",
          splitterSize: 1,
          endPanelControl: true,
          startPanel: this.renderCenterPane(this.props),
          endPanel: RightSidebar()
        })
      })
    );
  }
});

App.childContextTypes = {
  shortcuts: PropTypes.object
};

module.exports = connect(
  state => ({ sources: getSources(state),
              selectedSource: getSelectedSource(state),
            }),
  dispatch => bindActionCreators(actions, dispatch)
)(App);
