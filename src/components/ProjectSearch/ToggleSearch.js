import React, { Component, PropTypes } from "react";
import classnames from "classnames";

export default class ToggleSearch extends Component {
  render() {
    const { kind, toggle } = this.props;
    const isSourcesActive = kind === "sources";
    return (
      <div className="toggle-search">
        <span
          className={classnames("text", { active: isSourcesActive })}
          onClick={toggle}
        >
          {L10N.getStr("sourceSearch.search")}
        </span>
        <span
          className={classnames("text", { active: !isSourcesActive })}
          onClick={toggle}
        >
          {L10N.getStr("projectTextSearch.placeholder")}
        </span>
      </div>
    );
  }
}

ToggleSearch.propTypes = {
  kind: PropTypes.string.isRequired,
  toggle: PropTypes.func.isRequired
};

ToggleSearch.displayName = "ToggleSearch";
