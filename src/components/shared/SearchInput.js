/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import React, { Component } from "react";
import { isEnabled } from "devtools-config";
import Svg from "./Svg";
import classnames from "classnames";
import CloseButton from "./Button/Close";
import "./SearchInput.css";

const arrowBtn = (onClick, type, className, tooltip) => {
  const props = {
    onClick,
    type,
    className,
    title: tooltip,
    key: type
  };

  return (
    <button {...props}>
      <Svg name={type} />
    </button>
  );
};

class SearchInput extends Component {
  displayName: "SearchInput";
  props: {
    query: string,
    count: number,
    placeholder: string,
    summaryMsg: string,
    onChange: () => void,
    handleClose: () => void,
    showErrorEmoji: boolean,
    onKeyUp: () => void,
    onKeyDown: () => void,
    onFocus: () => void,
    onBlur: () => void,
    size: string,
    handleNext: () => void,
    handlePrev: () => void
  };

  static defaultProps = {
    size: "",
    showErrorEmoji: true
  };

  componentDidMount() {
    this.$input.focus();
    if (this.$input.value != "") {
      this.$input.setSelectionRange(
        this.$input.value.length + 1,
        this.$input.value.length + 1
      );
    }
  }

  componentDidUpdate() {
    this.$input.focus();
    if (this.$input.value != "") {
      this.$input.setSelectionRange(
        this.$input.value.length + 1,
        this.$input.value.length + 1
      );
    }
  }

  shouldShowErrorEmoji() {
    const { count, query, showErrorEmoji } = this.props;
    return count === 0 && query.trim() !== "" && !showErrorEmoji;
  }

  renderSvg() {
    if (this.shouldShowErrorEmoji()) {
      return <Svg name="sad-face" />;
    }

    return <Svg name="magnifying-glass" />;
  }

  renderArrowButtons() {
    const { handleNext, handlePrev } = this.props;

    return [
      arrowBtn(
        handleNext,
        "arrow-down",
        classnames("nav-btn", "next"),
        L10N.getFormatStr("editor.searchResults.nextResult")
      ),
      arrowBtn(
        handlePrev,
        "arrow-up",
        classnames("nav-btn", "prev"),
        L10N.getFormatStr("editor.searchResults.prevResult")
      )
    ];
  }

  renderNav() {
    if (!isEnabled("searchNav")) {
      return;
    }

    const { count, handleNext, handlePrev } = this.props;
    if ((!handleNext && !handlePrev) || (!count || count == 1)) {
      return;
    }

    return (
      <div className="search-nav-buttons">{this.renderArrowButtons()}</div>
    );
  }

  render() {
    const {
      query,
      placeholder,
      summaryMsg,
      onChange,
      onKeyDown,
      onKeyUp,
      onFocus,
      onBlur,
      handleClose,
      size
    } = this.props;

    const inputProps = {
      className: classnames({
        empty: this.shouldShowErrorEmoji()
      }),
      onChange,
      onKeyDown,
      onKeyUp,
      onFocus,
      onBlur,
      placeholder,
      value: query,
      spellCheck: false,
      ref: c => (this.$input = c)
    };

    return (
      <div className={classnames("search-field", size)}>
        {this.renderSvg()}
        <input {...inputProps} />
        <div className="summary">{summaryMsg || ""}</div>
        {this.renderNav()}
        <CloseButton handleClick={handleClose} buttonClass={size} />
      </div>
    );
  }
}

export default SearchInput;
