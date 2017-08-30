// @flow
import { Component } from "react";

let markerEl = document.createElement("div");

function makeMarker() {
  let marker = markerEl.cloneNode(true);
  marker.className = "editor hit-marker";
  return marker;
}

type Props = {
  hitData: { [string]: any },
  editor: any
};

class HitMarker extends Component<> {
  static defaultProps: Props;
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
    this.addMarker();
  }

  componentDidUpdate() {
    this.addMarker();
  }

  componentWillUnmount() {
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

export default HitMarker;
