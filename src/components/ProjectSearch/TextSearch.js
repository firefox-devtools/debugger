import { Component, DOM as dom, createFactory } from "react";
import classnames from "classnames";

import Svg from "../shared/Svg";
import _ManagedTree from "../shared/ManagedTree";
const ManagedTree = createFactory(_ManagedTree);

import "./TextSearch.css";

export default class TextSearch extends Component {
  constructor(props: Props) {
    super(props);
  }

  renderFile(file, expanded) {
    return dom.div(
      {
        className: "file-result",
        style: {}
      },
      Svg("arrow", {
        className: classnames({
          expanded
        })
      }),
      file.filepath
    );
  }

  renderLine(match) {
    return dom.div(
      {
        className: "result"
      },
      dom.span(
        {
          className: "line-number"
        },
        match.line
      ),
      dom.span(
        { className: "line-match", style: { display: "flex", grow: 1 } },
        match.value
      )
    );
  }

  renderResults() {
    const { results } = this.props;
    return ManagedTree({
      getRoots: () => results,
      getChildren: file => {
        return file.matches || [];
      },
      itemHeight: 20,
      autoExpand: 1,
      autoExpandDepth: 1,
      getParent: item => null,
      getKey: item => item.filepath || `${item.value}/${item.line}`,
      renderItem: (item, depth, focused, _, expanded) =>
        item.filepath ? this.renderFile(item, expanded) : this.renderLine(item)
    });
  }

  render() {
    return dom.div(
      {
        className: "project-text-search"
      },
      this.renderResults()
    );
  }
}
