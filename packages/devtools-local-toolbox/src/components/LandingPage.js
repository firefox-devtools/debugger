const React = require("react");
const { connect } = require("react-redux");
const classnames = require("classnames");
const { getTabs } = require("../selectors");
const { getValue } = require("devtools-config");

require("./LandingPage.css");
const { DOM: dom } = React;
const ImPropTypes = require("react-immutable-proptypes");

const githubUrl = "https://github.com/devtools-html/debugger.html/blob/master";

function getTabsByClientType(tabs, clientType) {
  return tabs.valueSeq()
    .filter(tab => tab.get("clientType") == clientType);
}

function firstTimeMessage(title, urlPart) {
  return dom.div(
    { className: "footer-note" },
    `First time connecting to ${title}? Checkout out the `,
    dom.a({ href: `${githubUrl}/CONTRIBUTING.md#${urlPart}` }, "docs"),
    "."
  );
}

function getTabURL(tab, paramName) {
  const hostURL = getValue("host");
  const tabID = tab.get("id");
  return `${hostURL}?${paramName}=${tabID}`;
}

const LandingPage = React.createClass({
  propTypes: {
    tabs: ImPropTypes.map.isRequired
  },

  displayName: "LandingPage",

  getInitialState() {
    return {
      selectedPane: "Firefox"
    };
  },

  renderTabs(tabTitle, tabs, paramName) {
    if (!tabs || tabs.count() == 0) {
      return dom.div({}, "");
    }

    return dom.div(
      { className: "tab-group" },
      dom.ul(
        { className: "tab-list" },
        tabs.valueSeq().map(tab => dom.li(
          { "className": "tab",
            "key": tab.get("id"),
            "onClick": () => {
              window.location = getTabURL(tab, paramName);
            }
          },
          dom.div({ className: "tab-title" }, tab.get("title")),
          dom.div({ className: "tab-url" }, tab.get("url"))
        ))
      )
    );
  },

  renderFirefoxPanel() {
    const targets = getTabsByClientType(this.props.tabs, "firefox");
    return dom.div(
      { className: "center" },
      this.renderTabs("", targets, "firefox-tab"),
      firstTimeMessage("Firefox", "firefox")
    );
  },

  renderChromePanel() {
    const targets = getTabsByClientType(this.props.tabs, "chrome");
    return dom.div(
      { className: "center" },
      this.renderTabs("", targets, "chrome-tab"),
      firstTimeMessage("Chrome", "chrome")
    );
  },

  renderNodePanel() {
    const targets = getTabsByClientType(this.props.tabs, "node");
    return dom.div(
      { className: "center" },
      this.renderTabs("", targets, "node-tab"),
      firstTimeMessage("Node", "node")
    );
  },

  renderPanel() {
    const panels = {
      Firefox: this.renderFirefoxPanel,
      Chrome: this.renderChromePanel,
      Node: this.renderNodePanel
    };

    return dom.div(
      {
        className: "panel"
      },
      dom.div(
        { className: "title" },
        dom.h2({}, this.state.selectedPane)
      ),
      panels[this.state.selectedPane]()
    );
  },

  renderSidebar() {
    let connections = [];

    if (getValue("firefox")) {
      connections.push("Firefox");
    }

    if (getValue("chrome")) {
      connections.push("Chrome", "Node");
    }

    return dom.div(
      {
        className: "sidebar"
      },
      dom.h1({}, getValue("title")),
      dom.ul(
        {},
        connections.map(title => dom.li(
          {
            className: classnames({
              selected: title == this.state.selectedPane
            }),
            key: title,

            onClick: () => this.setState({ selectedPane: title })
          },
          dom.a({}, title)
      )))
    );
  },

  render() {
    return dom.div(
      {
        className: "landing-page"
      },
      this.renderSidebar(),
      this.renderPanel()
    );
  }
});

module.exports = connect(
  state => ({ tabs: getTabs(state) })
)(LandingPage);
