/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import { parse } from "url";

import type { Node } from "./types";
import type { SourceRecord } from "../../types";
import { isPretty } from "../source";
const IGNORED_URLS = ["debugger eval code", "XStringBundle"];

export function nodeHasChildren(item: Node): boolean {
  return Array.isArray(item.contents);
}

export function isExactUrlMatch(pathPart: string, debuggeeUrl: string) {
  // compare to hostname with an optional 'www.' prefix
  const { host } = parse(debuggeeUrl);
  if (!host) {
    return false;
  }
  return host.replace(/^www\./, "") === pathPart.replace(/^www\./, "");
}

export function isDirectory(url: Object) {
  const parts = url.path.split("/").filter(p => p !== "");

  // Assume that all urls point to files except when they end with '/'
  // Or directory node has children
  return (
    (parts.length === 0 ||
      url.path.slice(-1) === "/" ||
      nodeHasChildren(url)) &&
    url.name != "(index)"
  );
}

export function getExtension(source: Object): string {
  const url = source.get ? source.get("url") : source.url;
  const parsedUrl = parse(url).pathname;
  if (!parsedUrl) {
    return "";
  }
  return parsedUrl.split(".").pop();
}

export function isNotJavaScript(source: Object): boolean {
  return ["css", "svg", "png"].includes(getExtension(source));
}

export function isInvalidUrl(url: Object, source: SourceRecord) {
  return (
    IGNORED_URLS.indexOf(url) != -1 ||
    !source.get("url") ||
    !url.group ||
    isPretty(source) ||
    isNotJavaScript(source)
  );
}

export function partIsFile(index: number, parts: Array<string>, url: Object) {
  const isLastPart = index === parts.length - 1;
  return !isDirectory(url) && isLastPart;
}

export function createNode(
  name: string,
  path: string,
  contents: SourceRecord | Array<Node>
): Node {
  return {
    name,
    path,
    contents
  };
}

export function createParentMap(tree: Node): WeakMap<Node, Node> {
  const map = new WeakMap();

  function _traverse(subtree) {
    if (nodeHasChildren(subtree)) {
      for (const child of subtree.contents) {
        map.set(child, subtree);
        _traverse(child);
      }
    }
  }

  // Don't link each top-level path to the "root" node because the
  // user never sees the root
  tree.contents.forEach(_traverse);
  return map;
}

export function getRelativePath(url: string) {
  const { pathname } = parse(url);
  if (!pathname) {
    return url;
  }
  const path = pathname.split("/");
  path.shift();
  return path.join("/");
}
