// @flow

import type {
  ActiveSearchType,
  OrientationType,
  SelectedPrimaryPaneTabType
} from "../../reducers/ui";

export type panelPositionType = "start" | "end";

export type UIAction =
  | {|
      type: "TOGGLE_ACTIVE_SEARCH",
      value: ?ActiveSearchType
    |}
  | {|
      type: "OPEN_QUICK_OPEN",
      query?: string
    |}
  | {|
      type: "CLOSE_QUICK_OPEN"
    |}
  | {|
      type: "TOGGLE_FRAMEWORK_GROUPING",
      value: boolean
    |}
  | {|
      type: "SHOW_SOURCE",
      sourceUrl: string
    |}
  | {|
      type: "TOGGLE_PANE",
      position: panelPositionType,
      paneCollapsed: boolean
    |}
  | {|
      type: "SET_CONTEXT_MENU",
      contextMenu: { type: string, event: any }
    |}
  | {|
      type: "SET_ORIENTATION",
      orientation: OrientationType
    |}
  | {|
      type: "HIGHLIGHT_LINES",
      location: {
        start: number,
        end: number,
        sourceId: number
      }
    |}
  | {|
      type: "CLEAR_HIGHLIGHT_LINES"
    |}
  | {|
      type: "OPEN_CONDITIONAL_PANEL",
      line: number
    |}
  | {|
      type: "CLOSE_CONDITIONAL_PANEL"
    |}
  | {|
      type: "SET_PROJECT_DIRECTORY_ROOT",
      url: Object
    |}
  | {|
      type: "SET_PRIMARY_PANE_TAB",
      tabName: SelectedPrimaryPaneTabType
    |}
  | {|
      type: "CLOSE_PROJECT_SEARCH"
    |};
