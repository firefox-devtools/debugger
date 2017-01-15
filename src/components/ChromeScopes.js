const React = require("react");
const { bindActionCreators } = require("redux");
const { connect } = require("react-redux");
const actions = require("../actions");
const { getChromeScopes } = require("../selectors");
const { DOM: dom, PropTypes } = React;
const classnames = require("classnames");
const Svg = require("./shared/Svg");

require("./Scopes.css");

const Scopes = React.createClass({
  propTypes: {
    scopes: PropTypes.array
  },

  displayName: "Scopes",

  renderScopes() {
    const { scopes } = this.props;

    if (!scopes) {
      return dom.div({ className: "pane-info" },
        L10N.getStr("scopes.notAvailable"));
    }

    return scopes.map(scope => dom.div({},
      this.renderItem(scope.name || scope.type)
    ));
  },

  renderItem(name) {
    return dom.div(
      { className: classnames("node"),
        style: { marginLeft: 15 },
      },
      Svg("arrow", {
        className: classnames({
          expanded: false,
        })
      }),
      dom.span({ className: "object-label" }, name),
    );
  },

  render() {
    return dom.div(
      { className: "pane scopes-list" },
      this.renderScopes()
    );
  }
});

module.exports = connect(
  state => ({
    scopes: getChromeScopes(state),
  }),
  dispatch => bindActionCreators(actions, dispatch)
)(Scopes);
