import { DOM as dom, PropTypes, Component } from "react";
import Svg from "./Svg";
import classnames from "classnames";
import CloseButton from "./Button/Close";
import "./SearchInput.css";

class SearchInput extends Component {
  displayName: "SearchInput";

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
      CloseButton({
        handleClick: handleClose,
        buttonClass: size
      })
    );
  }
}

SearchInput.propTypes = {
  query: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  placeholder: PropTypes.string.isRequired,
  summaryMsg: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  handleClose: PropTypes.func.isRequired,
  onKeyUp: PropTypes.func,
  onKeyDown: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  size: PropTypes.string
};

export default SearchInput;
