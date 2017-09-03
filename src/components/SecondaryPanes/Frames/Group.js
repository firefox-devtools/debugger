// @flow
import { DOM as dom, Component, createFactory } from "react";
import classNames from "classnames";
import Svg from "../../shared/Svg";
import { formatDisplayName, getLibraryFromUrl } from "../../../utils/frame";
import FrameMenu from "./FrameMenu";

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

export default class Group extends Component<> {
  static defaultProps: {
    group: LocalFrame[],
    selectedFrame: LocalFrame,
    selectFrame: Function,
    toggleFrameworkGrouping: Function,
    copyStackTrace: Function,
    toggleBlackBox: Function,
    frameworkGroupingOn: boolean
  };

  toggleFrames: Function;

  constructor(...args: any[]) {
    super(...args);
    this.state = { expanded: false };
    const self: any = this;

    self.toggleFrames = this.toggleFrames.bind(this);
  }

  onContextMenu(event: SyntheticKeyboardEvent<>) {
    const {
      group,
      copyStackTrace,
      toggleFrameworkGrouping,
      toggleBlackBox,
      frameworkGroupingOn
    } = this.props;
    const frame = group[0];
    FrameMenu(
      frame,
      frameworkGroupingOn,
      { copyStackTrace, toggleFrameworkGrouping, toggleBlackBox },
      event
    );
  }

  toggleFrames() {
    this.setState({ expanded: !this.state.expanded });
  }

  renderFrames() {
    const {
      group,
      selectFrame,
      selectedFrame,
      toggleFrameworkGrouping,
      frameworkGroupingOn,
      toggleBlackBox,
      copyStackTrace
    } = this.props;

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
          toggleFrameworkGrouping,
          frameworkGroupingOn,
          selectFrame,
          selectedFrame,
          toggleBlackBox,
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
      {
        className: classNames("frames-group", { expanded }),
        onContextMenu: e => this.onContextMenu(e)
      },
      this.renderDescription(),
      this.renderFrames()
    );
  }
}

Group.displayName = "Group";
