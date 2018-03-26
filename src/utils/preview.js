/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import type { Grip } from "../types";

const IMMUTABLE_FIELDS = ["_root", "__ownerID", "__altered", "__hash"];

export function isImmutable(result: Grip) {
  if (!result || !result.preview) {
    return;
  }

  const ownProperties = result.preview.ownProperties;
  if (!ownProperties) {
    return;
  }

  return IMMUTABLE_FIELDS.every(field =>
    Object.keys(ownProperties).includes(field)
  );
}

export function isReactComponent(result: Grip) {
  if (!result || !result.preview) {
    return;
  }

  const ownProperties = result.preview.ownProperties;
  if (!ownProperties) {
    return;
  }

  return (
    Object.keys(ownProperties).includes("_reactInternalInstance") ||
    Object.keys(ownProperties).includes("_reactInternalFiber")
  );
}

export function isConsole(expression: string) {
  return /^console/.test(expression);
}
