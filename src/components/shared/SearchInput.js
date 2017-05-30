import { DOM as dom, Component } from "react";
import { isEnabled } from "devtools-config";
import Svg from "./Svg";
import classnames from "classnames";
import CloseButton from "./Button/Close";
import "./SearchInput.css";

const arrowBtn = (onClick, type, className, tooltip) => {
  return dom.button(
    {
      onClick,
      type,
      className,
      title: tooltip,
      key: type
    },
    Svg(type)
  );
};

class SearchInput extends Component {
  displayName: "SearchInput";
  props: {
    query: string,
    count: number,
    placeholder: string,
    summaryMsg: string,
    onChange: () => any,
    handleClose: () => any,
    onKeyUp: () => any,
    onKeyDown: () => any,
    onFocus: () => any,
    onBlur: () => any,
    size: string,
    handleNext: () => any,
    handlePrev: () => any
  };

  static get defaultProps() {
    return {
      size: ""
    };
  }

  renderSvg() {
    const { count, query } = this.props;

    if (count == 0 && query.trim() != "") {
      return Svg("sad-face");
    }

    return Svg("magnifying-glass");
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

    return dom.div(
      { className: "search-nav-buttons" },
      this.renderArrowButtons()
    );
  }

  render() {
    const {
      query,
      placeholder,
      count,
      summaryMsg,
      onChange,
      onKeyDown,
      onKeyUp,
      onFocus,
      onBlur,
      handleClose,
      size
    } = this.props;

    return dom.div(
      {
        className: `search-field ${size}`
      },
      this.renderSvg(),
      dom.input({
        className: classnames({
          empty: count == 0 && query.trim() != ""
        }),
        onChange,
        onKeyDown,
        onKeyUp,
        onFocus,
        onBlur,
        placeholder,
        value: query,
        spellCheck: false
      }),
      dom.div({ className: "summary" }, query != "" ? summaryMsg : ""),
      this.renderNav(),
      CloseButton({
        handleClick: handleClose,
        buttonClass: size
      })
    );
  }
}

export default SearchInput;
