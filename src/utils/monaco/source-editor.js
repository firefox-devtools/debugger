/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

// (1) Desired editor features:
import "monaco-editor/esm/vs/editor/browser/controller/coreCommands.js";
import "monaco-editor/esm/vs/editor/contrib/hover/hover.js";
import "monaco-editor/esm/vs/editor/contrib/folding/folding.js";
import "monaco-editor/esm/vs/editor/standalone/browser/quickOpen/gotoLine.js";
import { ModelDecorationOptions } from "monaco-editor/esm/vs/editor/common/model/textModel";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api.js";

import "monaco-editor/esm/vs/basic-languages/monaco.contribution";

self.MonacoEnvironment = {
  getWorkerUrl: function(moduleId, label) {
    if (label === "json") {
      return "./assets/build/json.worker.js";
    }
    if (label === "css") {
      return "./assets/build/css.worker.js";
    }
    if (label === "html") {
      return "./assets/build/html.worker.js";
    }
    if (label === "typescript" || label === "javascript") {
      return "./assets/build/ts.worker.js";
    }
    return "./assets/build/editor.worker.js";
  }
};

export class SourceEditor {
  opts: any;
  editor: any;

  constructor(opts: any) {
    this.opts = opts;
  }

  appendToLocalElement(node: any) {
    this.editor = monaco.editor.create(node, this.opts);
  }

  get monaco() {
    return this.editor;
  }

  replaceDocument(doc: any) {
    this.editor.setModel(doc);
  }
}

export const EMPTY_LINES_DECORATION = ModelDecorationOptions.register({
  stickiness: 1,
  marginClassName: "empty-line"
});

export const BREAKPOINT_DECORATION = {
  DEFAULT: ModelDecorationOptions.register({
    stickiness: 1,
    marginClassName: "debug-breakpoint-hint"
  }),
  DISABLED: ModelDecorationOptions.register({
    stickiness: 1,
    marginClassName: "debug-breakpoint-hint disabled"
  }),
  CONDITION: ModelDecorationOptions.register({
    stickiness: 1,
    marginClassName: "debug-breakpoint-hint condition"
  }),
  DISABLED_CONDITION: ModelDecorationOptions.register({
    stickiness: 1,
    marginClassName: "debug-breakpoint-hint disabled condition"
  })
};
