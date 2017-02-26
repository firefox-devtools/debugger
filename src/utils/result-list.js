function scrollList(resultList, index) {
  const resultEl = resultList[index];
  resultEl.scrollIntoView({ block: "end", behavior: "smooth" });
}

function handleKeyDown(e: SyntheticKeyboardEvent) {
  const searchResults = this.getSearchResults(),
    resultCount = searchResults.length;

  if (e.key === "ArrowUp") {
    const selectedIndex = Math.max(0, this.state.selectedIndex - 1);
    this.setState({ selectedIndex });
    if (this.props.onSelectedItem) {
      this.props.onSelectedItem(searchResults[selectedIndex]);
    }
    e.preventDefault();
  } else if (e.key === "ArrowDown") {
    const selectedIndex = Math.min(
      resultCount - 1,
      this.state.selectedIndex + 1
    );
    this.setState({ selectedIndex });
    if (this.props.onSelectedItem) {
      this.props.onSelectedItem(searchResults[selectedIndex]);
    }
    e.preventDefault();
  } else if (e.key === "Enter") {
    if (searchResults.length) {
      this.props.selectItem(searchResults[this.state.selectedIndex]);
    } else {
      this.props.close(this.state.inputValue);
    }
    e.preventDefault();
  } else if (e.key === "Tab") {
    this.props.close(this.state.inputValue);
    e.preventDefault();
  }
}

module.exports = {
  scrollList,
  handleKeyDown
};
