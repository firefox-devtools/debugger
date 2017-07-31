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

  static defaultProps: Object;

  componentDidMount() {
    this.input.focus();
    this.input.select();
  }

  shouldShowErrorEmoji() {
    const { count, query, showErrorEmoji } = this.props;
    return count === 0 && query.trim() !== "" && !showErrorEmoji;
  }

  renderSvg() {
    if (this.shouldShowErrorEmoji()) {
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
        ref: c => (this.input = c)
      }),
      dom.div({ className: "summary" }, summaryMsg || ""),
      this.renderNav(),
      CloseButton({
        handleClick: handleClose,
        buttonClass: size
      })
    );
  }
}

SearchInput.defaultProps = {
  size: "",
  showErrorEmoji: true
};

export default SearchInput;
