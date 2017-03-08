const React = require("react");
const { DOM: dom, PropTypes } = React;
const classnames = require("classnames");
const Svg = require("./Svg");
const CloseButton = require("./Button/Close");

require("./SearchInput.css");

const SearchInput = React.createClass({
  propTypes: {
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
  },

  displayName: "SearchInput",

  getDefaultProps() {
    return {
      size: ""
    };
  },

  renderSvg() {
    const { count, query } = this.props;

    if (count == 0 && query.trim() != "") {
      return Svg("sad-face");
    }

    return Svg("magnifying-glass");
  },

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
        spellCheck: false,
      }),
      dom.div({ className: "summary" }, query != "" ? summaryMsg : ""),
      CloseButton({
        handleClick: handleClose,
        buttonClass: size
      })
    );
  }
});

module.exports = SearchInput;
