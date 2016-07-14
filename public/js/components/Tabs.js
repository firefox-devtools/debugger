const React = require("react");
const { connect } = require("react-redux");
const { getTabs } = require("../selectors");

require("./Tabs.css");
const dom = React.DOM;

function getTabsByBrowser(tabs, browser) {
  return tabs.valueSeq()
    .filter(tab => tab.get("browser") == browser);
}

function renderTabs(tabTitle, tabs, paramName) {
  if (tabs.count() == 0) {
    return null;
  }

  return dom.div(
    { className: `tab-group ${tabTitle}` },
    dom.div(
      { className: "tab-group-title" }, tabTitle),
    dom.ul(
      { className: "tab-list" },
      tabs.valueSeq().map(tab => dom.li(
        { "className": "tab",
          "key": tab.get("id"),
          "onClick": () => {
            window.location = "/?" + paramName + "=" + tab.get("id");
          } },
        dom.div({ className: "tab-title" }, tab.get("title")),
        dom.div({ className: "tab-url" }, tab.get("url"))
      ))
    )
  );
}

function Tabs({ tabs }) {
  const firefoxTabs = getTabsByBrowser(tabs, "firefox");
  const chromeTabs = getTabsByBrowser(tabs, "chrome");

  if (tabs.isEmpty()) {
    return dom.div(
      { className: "not-connected-message" },
      "No remote tabs found. You may be looking to ",
      dom.a({ href: "/?ws=localhost:5858/node" }, "connect to Node"),
      "."
    );
  }

  return dom.div(
    { className: "tabs" },
    renderTabs("Firefox Tabs", firefoxTabs, "firefox-tab"),
    renderTabs("Chrome Tabs", chromeTabs, "chrome-tab"),
    dom.div(
      { className: "node-message" },
      "You can also ",
      dom.a({ href: "/?ws=localhost:9229/node" },
            "connect to Node"),
      "."
    )
  );
}

module.exports = connect(
  state => ({ tabs: getTabs(state) })
)(Tabs);
