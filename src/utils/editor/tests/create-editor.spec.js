import { createEditor } from "../create-editor";
import SourceEditor from "../source-editor";

import { features } from "../../prefs";

describe("createEditor", () => {
  test("Returns a SourceEditor", () => {
    const editor = createEditor();
    expect(editor).toBeInstanceOf(SourceEditor);
    expect(editor.opts).toMatchSnapshot();
    expect(editor.opts.gutters).not.toContain("CodeMirror-foldgutter");
  });

  test("Adds codeFolding", () => {
    features.codeFolding = true;
    const editor = createEditor();
    expect(editor).toBeInstanceOf(SourceEditor);
    expect(editor.opts).toMatchSnapshot();
    expect(editor.opts.gutters).toContain("CodeMirror-foldgutter");
  });
});
