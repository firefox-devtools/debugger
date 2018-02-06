/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

/**
 * Sources reducer
 * @module reducers/sources
 */

import * as I from "immutable";
import { createSelector } from "reselect";
import makeRecord from "../utils/makeRecord";
import { getPrettySourceURL } from "../utils/source";
import { originalToGeneratedId, isOriginalId } from "devtools-source-map";
import { prefs } from "../utils/prefs";

import type { Map, List } from "immutable";
import type { Source, Location } from "../types";
import type { SelectedLocation, PendingSelectedLocation } from "./types";
import type { Action } from "../actions/types";
import type { Record } from "../utils/makeRecord";

export type SourceRecord = Record<Source>;
export type SourcesMap = Map<string, SourceRecord>;

export type SourcesState = {
  sources: SourcesMap,
  selectedLocation?: SelectedLocation,
  pendingSelectedLocation?: PendingSelectedLocation,
  selectedLocation?: Location
};

export function initialSourcesState(): Record<SourcesState> {
  return makeRecord(
    ({
      sources: I.Map(),
      selectedLocation: undefined,
      pendingSelectedLocation: prefs.pendingSelectedLocation,
      sourcesText: I.Map()
    }: SourcesState)
  )();
}

function update(
  state: Record<SourcesState> = initialSourcesState(),
  action: Action
): Record<SourcesState> {
  let location = null;

  switch (action.type) {
    case "UPDATE_SOURCE": {
      const source = action.source;
      return updateSource(state, source);
    }

    case "ADD_SOURCE": {
      return updateSource(state, action.source);
    }

    case "ADD_SOURCES": {
      return action.sources.reduce(
        (newState, source) => updateSource(newState, source),
        state
      );
    }

    case "SELECT_SOURCE":
      location = {
        ...action.location,
        url: action.source.url
      };

      prefs.pendingSelectedLocation = location;
      return state
        .set("selectedLocation", {
          sourceId: action.source.id,
          ...action.location
        })
        .set("pendingSelectedLocation", location);

    case "CLEAR_SELECTED_SOURCE":
      location = { url: "" };
      prefs.pendingSelectedLocation = location;

      return state
        .set("selectedLocation", { sourceId: "" })
        .set("pendingSelectedLocation", location);

    case "SELECT_SOURCE_URL":
      location = {
        url: action.url,
        line: action.line
      };

      prefs.pendingSelectedLocation = location;
      return state.set("pendingSelectedLocation", location);

    case "LOAD_SOURCE_TEXT":
      return setSourceTextProps(state, action);

    case "BLACKBOX":
      if (action.status === "done") {
        return state.setIn(
          ["sources", action.source.id, "isBlackBoxed"],
          action.value.isBlackBoxed
        );
      }
      break;

    case "NAVIGATE":
      const source = getSelectedSource({ sources: state });
      const url = source && source.get("url");

      if (!url) {
        return initialSourcesState();
      }

      return initialSourcesState().set("pendingSelectedLocation", { url });
  }

  return state;
}

function getTextPropsFromAction(action: any) {
  const { value, sourceId } = action;

  if (action.status === "start") {
    return { id: sourceId, loadedState: "loading" };
  } else if (action.status === "error") {
    return { id: sourceId, error: action.error, loadedState: "loaded" };
  }
  return {
    text: value.text,
    id: sourceId,
    contentType: value.contentType,
    loadedState: "loaded"
  };
}

// TODO: Action is coerced to `any` unfortunately because how we type
// asynchronous actions is wrong. The `value` may be null for the
// "start" and "error" states but we don't type it like that. We need
// to rethink how we type async actions.
function setSourceTextProps(state, action: any): Record<SourcesState> {
  const text = getTextPropsFromAction(action);
  return updateSource(state, text);
}

function updateSource(state: Record<SourcesState>, source: Source | Object) {
  if (!source.id) {
    return state;
  }

  return state.mergeIn(["sources", source.id], source);
}

// Selectors

// Unfortunately, it's really hard to make these functions accept just
// the state that we care about and still type it with Flow. The
// problem is that we want to re-export all selectors from a single
// module for the UI, and all of those selectors should take the
// top-level app state, so we'd have to "wrap" them to automatically
// pick off the piece of state we're interested in. It's impossible
// (right now) to type those wrapped functions.
type OuterState = { sources: Record<SourcesState> };

const getSourcesState = state => state.sources;

export function getSource(state: OuterState, id: string) {
  return getSourceInSources(getSources(state), id);
}

export function getSourceByURL(state: OuterState, url: string): ?SourceRecord {
  return getSourceByUrlInSources(state.sources.sources, url);
}

export function getGeneratedSource(state: OuterState, source: ?Source) {
  if (!source || !isOriginalId(source.id)) {
    return null;
  }
  return getSource(state, originalToGeneratedId(source.id));
}

export function getPendingSelectedLocation(state: OuterState) {
  return state.sources.pendingSelectedLocation;
}

export function getPrettySource(state: OuterState, id: string) {
  const source = getSource(state, id);
  if (!source) {
    return;
  }

  return getSourceByURL(state, getPrettySourceURL(source.get("url")));
}

export function hasPrettySource(state: OuterState, id: string) {
  return !!getPrettySource(state, id);
}

function getSourceByUrlInSources(sources: SourcesMap, url: string) {
  if (!url) {
    return null;
  }

  return sources.find(source => source.get("url") === url);
}

export function getSourceInSources(
  sources: SourcesMap,
  id: string
): SourceRecord {
  return sources.get(id);
}

export const getSources = createSelector(
  getSourcesState,
  sources => sources.sources
);

export const getSelectedLocation = createSelector(
  getSourcesState,
  sources => sources.selectedLocation
);

export const getSelectedSource = createSelector(
  getSelectedLocation,
  getSources,
  (selectedLocation, sources) => {
    if (!selectedLocation) {
      return;
    }

    return sources.get(selectedLocation.sourceId);
  }
);

export const getSelectedSourceText = createSelector(
  getSelectedSource,
  getSourcesState,
  (selectedSource, sources) => {
    const id = selectedSource.get("id");
    return id ? sources.sourcesText.get(id) : null;
  }
);

export default update;
