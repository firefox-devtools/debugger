const React = require("react");
const { connect } = require("react-redux");
const classnames = require("classnames");
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

function renderMessage(noTabs) {
  return dom.div(
    { className: classnames("connect-message", { "not-connected": noTabs })},
    dom.p(
      null,
      noTabs && "No remote tabs found. ",
      "You may be looking to ",
      dom.a({ href: `/?ws=${document.location.hostname}:9229/node` }, "connect to Node"),
      "."
    ),
    dom.p(
      null,
      "Make sure you run ",
      dom.a({ href: "https://github.com/devtools-html/debugger.html/blob/master/CONTRIBUTING.md#firefox" },
            "Firefox"),
      ", ",
      dom.a({ href: "https://github.com/devtools-html/debugger.html/blob/master/CONTRIBUTING.md#chrome" },
            "Chrome"),
      " or ",
      dom.a({ href: "https://github.com/devtools-html/debugger.html/blob/master/CONTRIBUTING.md#nodejs" },
            "Node"),
      " with the right flags."
    )
  );
}
function Tabs({ tabs }) {
  const firefoxTabs = getTabsByBrowser(tabs, "firefox");
  const chromeTabs = getTabsByBrowser(tabs, "chrome");

  return dom.div(
    { className: "tabs theme-light" },
    renderTabs("Firefox Tabs", firefoxTabs, "firefox-tab"),
    renderTabs("Chrome Tabs", chromeTabs, "chrome-tab"),
    renderMessage(tabs.isEmpty())
  );
}

module.exports = connect(
  state => ({ tabs: getTabs(state) })
)(Tabs);
