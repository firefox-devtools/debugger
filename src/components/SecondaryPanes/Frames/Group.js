// @flow
import { DOM as dom, Component, createFactory } from "react";
import classNames from "classnames";
import Svg from "../../shared/Svg";
import { formatDisplayName, getLibraryFromUrl } from "../../../utils/frame";

import "./Group.css";

import _FrameComponent from "./Frame";
const FrameComponent = createFactory(_FrameComponent);

import type { LocalFrame } from "./types";
import type { Frame } from "debugger-html";

function renderFrameLocation(frame: Frame) {
  const library = getLibraryFromUrl(frame);
  if (!library) {
    return null;
  }

  return dom.div(
    { className: "location" },
    library,
    Svg(library.toLowerCase(), { className: "annotation-logo" })
  );
}

export default class Group extends Component {
  state: {
    expanded: boolean
  };

  toggleFrames: Function;

  props: {
    group: LocalFrame[],
    selectedFrame: LocalFrame,
    selectFrame: Function,
    copyStackTrace: Function
  };

  constructor(...args: any[]) {
    super(...args);
    this.state = { expanded: false };
    const self: any = this;

    self.toggleFrames = this.toggleFrames.bind(this);
  }

  toggleFrames() {
    this.setState({ expanded: !this.state.expanded });
  }

  renderFrames() {
    const { group, selectFrame, selectedFrame, copyStackTrace } = this.props;
    const { expanded } = this.state;
    if (!expanded) {
      return null;
    }
    return dom.div(
      { className: "frames-list" },
      group.map(frame =>
        FrameComponent({
          frame,
          copyStackTrace,
          selectFrame,
          selectedFrame,
          key: frame.id,
          hideLocation: true,
          shouldMapDisplayName: false
        })
      )
    );
  }

  renderDescription() {
    const frame = this.props.group[0];
    const displayName = formatDisplayName(frame);
    return dom.li(
      {
        key: frame.id,
        className: classNames("group"),
        onClick: this.toggleFrames,
        tabIndex: 0
      },
      dom.div({ className: "title" }, displayName),
      renderFrameLocation(frame)
    );
  }

  render() {
    const { expanded } = this.state;
    return dom.div(
      { className: classNames("frames-group", { expanded }) },
      this.renderDescription(),
      this.renderFrames()
    );
  }
}

Group.displayName = "Group";
