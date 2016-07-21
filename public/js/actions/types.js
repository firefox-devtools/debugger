// @flow

export type AsyncStatus = "start" | "done" | "error";

export type Source = {
  id: string,
  url?: string,
  sourceMapURL?: string
};

export type SourceText = {
  id: string,
  text: string,
  contentType: string
}

export type Location = {
  sourceId: string,
  line: number,
  column?: number
}

export type Action =
  { type: "ADD_SOURCE", source: Source }
  | { type: "ADD_SOURCES", sources: Array<Source> }
  | { type: "SELECT_SOURCE", source: Source, options: { position?: number } }
  | { type: "CLOSE_TAB", id: string }
  | { type: "LOAD_SOURCE_TEXT",
      generatedSource: Source,
      originalSources: Array<Source>,
      status: AsyncStatus,
      error: string,
      value: {
        generatedSourceText: SourceText,
        originalSourceTexts: Array<SourceText>
      }}
  | { type: "BLACKBOX",
      source: Source,
      status: AsyncStatus,
      error: string,
      value: { isBlackBoxed: boolean }}
  | { type: "TOGGLE_PRETTY_PRINT",
      source: Source,
      status: AsyncStatus,
      error: string,
      value: { isPrettyPrinted: boolean,
               text: string,
               contentType: string }}
  | { type: "NAVIGATE" };
