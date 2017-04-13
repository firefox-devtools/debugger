// @flow
import { Component, PropTypes } from "react";

let markerEl = document.createElement("div");

function makeMarker() {
  let marker = markerEl.cloneNode(true);
  marker.className = "editor hit-marker";
  return marker;
}

class HitMarker extends Component {
  addMarker() {
    const hitData = this.props.hitData;
    const line = hitData.line - 1;

    this.props.editor.setGutterMarker(line, "hit-markers", makeMarker());

    this.props.editor.addLineClass(line, "line", "hit-marker");
  }

  shouldComponentUpdate(nextProps: any) {
    return (
      this.props.editor !== nextProps.editor ||
      this.props.hitData !== nextProps.hitData
    );
  }

  componentDidMount() {
    if (!this.props.editor) {
      return;
    }

    this.addMarker();
  }

  componentDidUpdate() {
    this.addMarker();
  }

  componentWillUnmount() {
    if (!this.props.editor) {
      return;
    }

    const hitData = this.props.hitData;
    const line = hitData.line - 1;

    this.props.editor.setGutterMarker(line, "hit-markers", null);
    this.props.editor.removeLineClass(line, "line", "hit-marker");
  }

  render() {
    return null;
  }
}

HitMarker.displayName = "HitMarker";

HitMarker.propTypes = {
  hitData: PropTypes.object.isRequired,
  editor: PropTypes.object.isRequired
};

export default HitMarker;
