"use strict";

function presentTabs(tabs) {
  const blacklist = ["New Tab", "Inspectable pages"];

  return tabs
    .filter(tab => {
      const isPage = tab.type == "page";
      const isBlacklisted = blacklist.indexOf(tab.title) != -1;

      return isPage && !isBlacklisted;
    })
    .map(tab => {
      return {
        title: tab.title,
        url: tab.url,
        id: tab.id,
        chrome: tab
      };
    });
}

function chromeTabs(callback) {
  fetch("/chrome-tabs").then(res => {
    res.json().then((body) => {
      callback(presentTabs(body));
    });
  });
}

module.exports = {
  chromeTabs
};
