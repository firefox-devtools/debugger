// @flow
import { DOM as dom, PropTypes, Component } from "react";
import { showMenu } from "devtools-launchpad";
import classNames from "classnames";
import Svg from "../../shared/Svg";

import { copyToTheClipboard } from "../../../utils/clipboard";
import { formatDisplayName, formatCopyName } from "../../../utils/frame";
import { getFilename } from "../../../utils/source";

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

  constructor(...args: any[]) {
    super(...args);
  }

  onContextMenu(event: SyntheticKeyboardEvent, frame: Frame, frames: Frame[]) {
    const copySourceUrlLabel = L10N.getStr("copySourceUrl");
    const copySourceUrlKey = L10N.getStr("copySourceUrl.accesskey");
    const copyStackTraceLabel = L10N.getStr("copyStackTrace");
    const copyStackTraceKey = L10N.getStr("copyStackTrace.accesskey");

    event.stopPropagation();
    event.preventDefault();

    const menuOptions = [];

    const source = frame.source;
    if (source) {
      const copySourceUrl = {
        id: "node-menu-copy-source",
        label: copySourceUrlLabel,
        accesskey: copySourceUrlKey,
        disabled: false,
        click: () => copyToTheClipboard(source.url)
      };

      menuOptions.push(copySourceUrl);
    }

    const framesToCopy = frames.map(f => formatCopyName(f)).join("\n");
    const copyStackTrace = {
      id: "node-menu-copy-source",
      label: copyStackTraceLabel,
      accesskey: copyStackTraceKey,
      disabled: false,
      click: () => copyToTheClipboard(framesToCopy)
    };

    menuOptions.push(copyStackTrace);

    showMenu(event, menuOptions);
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
      frames,
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
        onContextMenu: e => this.onContextMenu(e, frame, frames),
        tabIndex: 0
      },
      renderFrameTitle(frame, { shouldMapDisplayName }),
      !hideLocation ? renderFrameLocation(frame) : null
    );
  }
}

FrameComponent.propTypes = {
  frame: PropTypes.object.isRequired,
  frames: PropTypes.array,
  selectedFrame: PropTypes.object,
  selectFrame: PropTypes.func.isRequired,
  hideLocation: PropTypes.bool,
  shouldMapDisplayName: PropTypes.bool
};

FrameComponent.defaultProps = {
  hideLocation: false,
  shouldMapDisplayName: true
};

FrameComponent.displayName = "Frame";
