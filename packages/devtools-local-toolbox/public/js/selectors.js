function getTabs(state) {
  return state.tabs.get("tabs");
}

function getSelectedTab(state) {
  return state.tabs.get("selectedTab");
}

module.exports = {
  getTabs,
  getSelectedTab
};
