import { Component, PropTypes, createFactory } from "react";

import { isPretty, getSourcePath } from "../../utils/source";
import { endTruncateStr } from "../../utils/utils";

import _Autocomplete from "../shared/Autocomplete";
const Autocomplete = createFactory(_Autocomplete);

import type { SourcesMap } from "../../reducers/sources";

export default class SourceSearch extends Component {
  onEscape: Function;
  close: Function;
  toggleSourceSearch: Function;

  constructor(props: Props) {
    super(props);

    this.close = this.close.bind(this);

    this.state = {
      inputValue: ""
    };
  }

  componentWillUnmount() {
    const shortcuts = this.context.shortcuts;
    shortcuts.off("Escape", this.onEscape);
  }

  componentDidMount() {
    const shortcuts = this.context.shortcuts;
    shortcuts.on("Escape", this.onEscape);
  }

  onEscape(shortcut, e) {
    if (this.isProjectSearchEnabled()) {
      e.preventDefault();
      this.close();
    }
  }

  searchResults(sourceMap: SourcesMap) {
    return sourceMap
      .valueSeq()
      .toJS()
      .filter(source => !isPretty(source))
      .map(source => ({
        value: getSourcePath(source),
        title: getSourcePath(source).split("/").pop(),
        subtitle: endTruncateStr(getSourcePath(source), 100),
        id: source.id
      }));
  }

  close() {
    this.setState({ inputValue: "" });
  }

  render() {
    const { sources } = this.props;
    return Autocomplete({
      selectItem: (e, result) => {
        this.props.selectSource(result.id);
        this.close();
      },
      close: this.close,
      items: this.searchResults(sources),
      inputValue: this.state.inputValue,
      placeholder: L10N.getStr("sourceSearch.search"),
      size: "big"
    });
  }
}

SourceSearch.contextTypes = {
  shortcuts: PropTypes.object
};

SourceSearch.displayName = "SourceSearch";
