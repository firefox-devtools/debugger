// @flow

import type { Source, SourceId } from "debugger-html";

let cachedSources = new Map();

export function hasSource(sourceId: SourceId): boolean {
  return cachedSources.has(sourceId);
}

export function setSource(source: Source) {
  cachedSources.set(source.id, source);
}

export function getSource(sourceId: SourceId): Source {
  if (!cachedSources.has(sourceId)) {
    throw new Error(`${sourceId} was not provided.`);
  }
  return ((cachedSources.get(sourceId): any): Source);
}

export function clearSources() {
  cachedSources = new Map();
}
