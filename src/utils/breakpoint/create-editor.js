/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// @flow

import SourceEditor from "../editor/source-editor";

export function createEditor(value: string) {
  return new SourceEditor({
    mode: "javascript",
    foldGutter: false,
    enableCodeFolding: false,
    readOnly: "nocursor",
    lineNumbers: false,
    theme: "mozilla mozilla-breakpoint",
    styleActiveLine: false,
    lineWrapping: false,
    matchBrackets: false,
    showAnnotationRuler: false,
    gutters: false,
    value: value || "",
    scrollbarStyle: null
  });
}
