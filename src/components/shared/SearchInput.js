/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import React, { Component } from "react";
import Svg from "./Svg";
import classnames from "classnames";
import CloseButton from "./Button/Close";
import IncludeThirdPartiesToggle from "./Button/IncludeThirdPartiesToggle";
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
  includeThirdParties: boolean,
  onChange: (e: SyntheticInputEvent<HTMLInputElement>) => void,
  handleClose: (e: SyntheticMouseEvent<HTMLDivElement>) => void,
  onKeyUp?: (e: SyntheticKeyboardEvent<HTMLInputElement>) => void,
  onKeyDown: (e: SyntheticKeyboardEvent<HTMLInputElement>) => void,
  onFocus?: (e: SyntheticFocusEvent<HTMLInputElement>) => void,
  onBlur?: (e: SyntheticFocusEvent<HTMLInputElement>) => void,
  handleNext?: (e: SyntheticMouseEvent<HTMLButtonElement>) => void,
  handlePrev?: (e: SyntheticMouseEvent<HTMLButtonElement>) => void,
  toggleIncludeThirdParties?: () => void
};

class SearchInput extends Component<Props> {
  displayName: "SearchInput";
  $input: ?HTMLInputElement;

  static defaultProps = {
    size: "",
    showErrorEmoji: true
  };

  componentDidMount() {
    if (this.$input) {
      const input = this.$input;
      input.focus();
      if (input.value != "") {
        input.setSelectionRange(input.value.length + 1, input.value.length + 1);
      }
    }
  }

  shouldShowErrorEmoji = () => {
    const { count, query, showErrorEmoji } = this.props;
    return count === 0 && query.trim() !== "" && showErrorEmoji;
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
      includeThirdParties,
      onChange,
      onKeyDown,
      onKeyUp,
      onFocus,
      onBlur,
      handleClose,
      toggleIncludeThirdParties,
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

    const includeThirdPartiesToggleProps = {
      includeThirdParties,
      toggleIncludeThirdParties
    };

    return (
      <div className={classnames("search-field", size)}>
        {this.renderSvg()}
        <input {...inputProps} />
        <div className="summary">{summaryMsg || ""}</div>
        {this.renderNav()}
        <IncludeThirdPartiesToggle {...includeThirdPartiesToggleProps} />
        <CloseButton handleClick={handleClose} buttonClass={size} />
      </div>
    );
  }
}

export default SearchInput;
