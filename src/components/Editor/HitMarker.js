const React = require("react");
const { PropTypes } = React;

let markerEl = document.createElement("div");

function makeMarker() {
  let marker = markerEl.cloneNode(true);
  marker.className = "editor hit-marker";
  return marker;
}

const HitMarker = React.createClass({
  propTypes: {
    hitData: PropTypes.object,
    editor: PropTypes.object
  },

  displayName: "HitMarker",

  addMarker() {
    const hitData = this.props.hitData;
    const line = hitData.line - 1;

    this.props.editor.setGutterMarker(
      line,
      "hit-markers",
      makeMarker()
    );

    this.props.editor.addLineClass(line, "line", "hit-marker");
  },

  shouldComponentUpdate(nextProps) {
    return this.props.editor !== nextProps.editor ||
      this.props.hitData !== nextProps.hitData;
  },

  componentDidMount() {
    if (!this.props.editor) {
      return;
    }

    this.addMarker();
  },

  componentDidUpdate() {
    this.addMarker();
  },

  componentWillUnmount() {
    if (!this.props.editor) {
      return;
    }

    const hitData = this.props.hitData;
    const line = hitData.line - 1;

    this.props.editor.setGutterMarker(line, "hit-markers", null);
    this.props.editor.removeLineClass(line, "line", "hit-marker");
  },

  render() {
    return null;
  }
});

module.exports = HitMarker;
