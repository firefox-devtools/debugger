/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

import {
  getSources,
  getSelectedSource,
  getSourceInSources
} from "../reducers/sources";
import { getFrames } from "../reducers/pause";
import { getComponentAncestors } from "../reducers/components";
import { annotateFrames } from "../utils/pause/frames";
import { isOriginalId } from "devtools-source-map";
import { get } from "lodash";
import type { Frame, Source } from "../types";
import type { SourcesMap } from "../reducers/sources";
import { createSelector } from "reselect";

function getLocation(frame, isGeneratedSource) {
  return isGeneratedSource
    ? frame.generatedLocation || frame.location
    : frame.location;
}

function getSourceForFrame(sources, frame, isGeneratedSource) {
  const sourceId = getLocation(frame, isGeneratedSource).sourceId;
  return getSourceInSources(sources, sourceId);
}

function appendSource(sources, frame, selectedSource) {
  const isGeneratedSource =
    selectedSource && !isOriginalId(selectedSource.get("id"));

  return {
    ...frame,
    location: getLocation(frame, isGeneratedSource),
    source: getSourceForFrame(sources, frame, isGeneratedSource).toJS()
  };
}

function getAncestorFrames(ancestors) {
  if (!ancestors) {
    return [];
  }

  return ancestors
    .filter(ancestor => typeof ancestor.class == "object")
    .reverse()
    .slice(1)
    .map(ancestor => {
      return {
        id: ancestor.id,
        component: ancestor.name,
        displayName: "render",
        location: ancestor.class.location
      };
    });
}

export function formatCallStackFrames(
  frames: Frame[],
  sources: SourcesMap,
  selectedSource: Source,
  ancestors: Object[]
) {
  if (!frames) {
    return null;
  }

  const ancestorFrames = getAncestorFrames(ancestors);

  const formattedFrames = frames
    .filter(frame => getSourceForFrame(sources, frame))
    .map(frame => appendSource(sources, frame, selectedSource))
    .filter(frame => !get(frame, "source.isBlackBoxed"));

  const annotatedFrames = annotateFrames(formattedFrames);
  if (ancestors) {
    return annotatedFrames
      .filter(frame => !frame.library)
      .concat(ancestorFrames);
  }

  return annotatedFrames;
}

export const getCallStackFrames = createSelector(
  getFrames,
  getSources,
  getSelectedSource,
  getComponentAncestors,
  formatCallStackFrames
);
