/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import makeRecord from "../utils/makeRecord";

import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";

export type Component = {
  +id: string,
  +name: string,
  +class: string | Object,
  +node: { props: Object, state: Object }
};

export function initialComponentsState() {
  return makeRecord(
    ({
      ancestors: null,
      selectedComponentId: null
    }: ComponentsState)
  )();
}

export type ComponentsState = {
  ancestors: ?(Component[]),
  selectedComponentId: ?string
};

function update(
  state: Record<ComponentsState> = initialComponentsState(),
  action: Action
): Record<ComponentsState> {
  switch (action.type) {
    case "SELECT_COMPONENT": {
      return state.set("selectedComponentId", action.id);
    }
    case "SET_COMPONENT_ANCESTORS": {
      return state.set("ancestors", action.ancestors);
    }
    case "SELECT_FRAME": {
      return state.set("selectedComponentId", null);
    }
    case "RESUME":
      return state.set("ancestors", null).set("selectedComponentId", null);

    default: {
      return state;
    }
  }
}

export function getComponentAncestors(state: OuterState): Component[] {
  return state.components.ancestors;
}

export function getSelectedComponentId(state: OuterState) {
  return state.components.selectedComponentId;
}

export function getSelectedComponent(state: OuterState): ?Component {
  return (getComponentAncestors(state) || []).find(
    ancestor => ancestor.id == state.components.selectedComponentId
  );
}

export default update;
