import { Component, DOM as dom, PropTypes } from "react";
import classnames from "classnames";

export default class ToggleSearch extends Component {
  render() {
    const { kind, toggle } = this.props;
    const isSourcesActive = kind === "sources";
    return dom.div(
      { className: "toggle-search" },
      dom.span(
        {
          className: classnames("text", { active: isSourcesActive }),
          onClick: toggle
        },
        L10N.getStr("sourceSearch.search")
      ),
      dom.span(
        {
          className: classnames("text", { active: !isSourcesActive }),
          onClick: toggle
        },
        L10N.getStr("projectTextSearch.placeholder")
      )
    );
  }
}

ToggleSearch.propTypes = {
  kind: PropTypes.string.isRequired,
  toggle: PropTypes.func.isRequired
};

ToggleSearch.displayName = "ToggleSearch";
