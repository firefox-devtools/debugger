/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { Component } from "react";
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

type Props = {
  query: string,
  count: number,
  placeholder: string,
  summaryMsg: string,
  size: string,
  showErrorEmoji: boolean,
  expanded: boolean,
  selectedItemId?: string,
  onChange: (e: SyntheticInputEvent<HTMLInputElement>) => void,
  handleClose: (e: SyntheticMouseEvent<HTMLDivElement>) => void,
  onKeyUp?: (e: SyntheticKeyboardEvent<HTMLInputElement>) => void,
  onKeyDown: (e: SyntheticKeyboardEvent<HTMLInputElement>) => void,
  onFocus?: (e: SyntheticFocusEvent<HTMLInputElement>) => void,
  onBlur?: (e: SyntheticFocusEvent<HTMLInputElement>) => void,
  handleNext?: (e: SyntheticMouseEvent<HTMLButtonElement>) => void,
  handlePrev?: (e: SyntheticMouseEvent<HTMLButtonElement>) => void
};

class SearchInput extends Component<Props> {
  displayName: "SearchInput";
  $input: ?HTMLInputElement;

  static defaultProps = {
    size: "",
    showErrorEmoji: true,
    expanded: false,
    selectedItemId: ""
  };

  componentDidMount() {
    if (this.$input) {
      const input = this.$input;
      input.focus();
      if (input.value != "") {
        input.select();
      }
    }
  }

  shouldShowErrorEmoji = () => {
    const { count, query, showErrorEmoji } = this.props;
    return showErrorEmoji && count === 0 && query.trim() !== "";
  };

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
      size,
      expanded,
      selectedItemId
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
      "aria-autocomplete": "list",
      "aria-controls": "result-list",
      "aria-activedescendant":
        expanded && selectedItemId ? `${selectedItemId}-title` : "",
      placeholder,
      value: query,
      spellCheck: false,
      ref: c => (this.$input = c)
    };

    return (
      <div
        className={classnames("search-field", size)}
        role="combobox"
        aria-haspopup="listbox"
        aria-owns="result-list"
        aria-expanded={expanded}
      >
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
