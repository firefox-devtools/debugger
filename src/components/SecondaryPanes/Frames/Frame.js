// @flow
import { DOM as dom, Component } from "react";
import classNames from "classnames";
import Svg from "../../shared/Svg";

import { formatDisplayName } from "../../../utils/frame";
import { getFilename } from "../../../utils/source";
import FrameMenu from "./FrameMenu";

import type { Frame } from "debugger-html";
import type { LocalFrame } from "./types";

function renderFrameTitle(frame: Frame, options) {
  const displayName = formatDisplayName(frame, options);
  return dom.div({ className: "title" }, displayName);
}

function renderFrameLocation({ source, location, library }: LocalFrame) {
  if (!source) {
    return;
  }

  if (library) {
    return dom.div(
      { className: "location" },
      library,
      Svg(library.toLowerCase(), { className: "annotation-logo" })
    );
  }

  const filename = getFilename(source);
  return dom.div({ className: "location" }, `${filename}: ${location.line}`);
}

export default class FrameComponent extends Component {
  static defaultProps: {
    hideLocation: boolean,
    shouldMapDisplayName: boolean
  };

  props: {
    frame: LocalFrame,
    selectedFrame: LocalFrame,
    copyStackTrace: Function,
    toggleFrameworkGrouping: Function,
    selectFrame: Function,
    frameworkGroupingOn: boolean,
    hideLocation: boolean,
    shouldMapDisplayName: boolean,
    toggleBlackBox: Function
  };

  constructor() {
    super();
  }

  onContextMenu(event: SyntheticKeyboardEvent) {
    const {
      frame,
      copyStackTrace,
      toggleFrameworkGrouping,
      toggleBlackBox,
      frameworkGroupingOn
    } = this.props;
    FrameMenu(
      frame,
      frameworkGroupingOn,
      { copyStackTrace, toggleFrameworkGrouping, toggleBlackBox },
      event
    );
  }

  onMouseDown(e: SyntheticKeyboardEvent, frame: Frame, selectedFrame: Frame) {
    if (e.nativeEvent.which == 3 && selectedFrame.id != frame.id) {
      return;
    }
    this.props.selectFrame(frame);
  }

  onKeyUp(event: SyntheticKeyboardEvent, frame: Frame, selectedFrame: Frame) {
    if (event.key != "Enter" || selectedFrame.id == frame.id) {
      return;
    }
    this.props.selectFrame(frame);
  }

  render() {
    const {
      frame,
      selectedFrame,
      hideLocation,
      shouldMapDisplayName
    } = this.props;

    return dom.li(
      {
        key: frame.id,
        className: classNames("frame", {
          selected: selectedFrame && selectedFrame.id === frame.id
        }),
        onMouseDown: e => this.onMouseDown(e, frame, selectedFrame),
        onKeyUp: e => this.onKeyUp(e, frame, selectedFrame),
        onContextMenu: e => this.onContextMenu(e),
        tabIndex: 0
      },
      renderFrameTitle(frame, { shouldMapDisplayName }),
      !hideLocation ? renderFrameLocation(frame) : null
    );
  }
}

FrameComponent.defaultProps = {
  hideLocation: false,
  shouldMapDisplayName: true
};

FrameComponent.displayName = "Frame";
