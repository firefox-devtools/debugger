import { Component, DOM as dom, PropTypes } from "react";

export default class ToggleSearch extends Component {
  render() {
    const { kind, toggle } = this.props;
    return dom.div(
      { className: "toggle-search" },
      dom.span({ className: "title" }, "Search:"),
      kind === "sources"
        ? dom.span(
            {},
            dom.span({ className: "text active" }, "sources"),
            dom.span({ className: "text", onClick: toggle }, "text")
          )
        : dom.span(
            {},
            dom.span({ className: "text", onClick: toggle }, "sources"),
            dom.span({ className: "text active" }, "text")
          )
    );
  }
}

ToggleSearch.propTypes = {
  kind: PropTypes.string.isRequired,
  toggle: PropTypes.func.isRequired
};

ToggleSearch.displayName = "ToggleSearch";
