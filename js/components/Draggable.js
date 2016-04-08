const React = require('react');
const ReactDOM = require('react-dom');
const { DOM: dom, PropTypes } = React;

const Draggable = React.createClass({
  displayName: 'Draggable',

  propTypes: {
    onMove: PropTypes.func.isRequired,
    onStart: PropTypes.func,
    onStop: PropTypes.func,
    style: PropTypes.object,
    className: PropTypes.string
  },

  onMove(ev) {
    ev.preventDefault();
    this.props.onMove(ev.pageX, ev.pageY);
  },

  onUp(ev) {
    ev.preventDefault();
    const doc = ReactDOM.findDOMNode(this).ownerDocument;
    doc.removeEventListener('mousemove', this.onMove);
    doc.removeEventListener('mouseup', this.onUp);
    this.props.onStop && this.props.onStop();
  },

  startDragging(ev) {
    ev.preventDefault();
    const doc = ReactDOM.findDOMNode(this).ownerDocument;
    doc.addEventListener('mousemove', this.onMove);
    doc.addEventListener('mouseup', this.onUp);
    this.props.onStart && this.props.onStart();
  },


  render() {
    return dom.div({
      style: this.props.style,
      className: this.props.className,
      onMouseDown: this.startDragging
    });
  }
});

module.exports = Draggable;
