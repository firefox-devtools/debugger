import { isFirefox } from "devtools-config";

function scrollList(resultList, index) {
  if (!resultList.hasOwnProperty(index)) {
    return;
  }

  const resultEl = resultList[index];

  if (isFirefox()) {
    resultEl.scrollIntoView({ block: "end", behavior: "smooth" });
  } else {
    chromeScrollList(resultEl, index);
  }
}

function chromeScrollList(elem, index) {
  const resultsEl = elem.parentNode;
  if (!resultsEl || resultsEl.children.length === 0) {
    return;
  }

  const resultsHeight = resultsEl.clientHeight;
  const itemHeight = resultsEl.children[0].clientHeight;
  const numVisible = resultsHeight / itemHeight;
  const positionsToScroll = index - numVisible + 1;
  const itemOffset = resultsHeight % itemHeight;
  const scroll = positionsToScroll * (itemHeight + 2) + itemOffset;

  resultsEl.scrollTop = Math.max(0, scroll);
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

export { scrollList, handleKeyDown };
