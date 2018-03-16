// import * as monaco from "@timkendrick/monaco-editor/dist/external";
import * as monaco from "monaco-editor";

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

export default class SourceEditor {
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
