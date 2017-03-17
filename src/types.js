// @flow

export type SearchModifiers = {
  caseSensitive: boolean,
  wholeWord: boolean,
  regexMatch: boolean,
};

export type Expression = {
  value: Object,
  input: string,
};

export type Mode =
  | String
  | {
      name: string,
      typescript?: boolean,
      base?: {
        name: string,
        typescript: boolean,
      },
    };

export type AlignOpts = "top" | "center" | "bottom";

export type {
  Breakpoint,
  Frame,
  Grip,
  LoadedObject,
  Location,
  Source,
  SourceText,
  Pause,
  Why,
} from "devtools-client-adapters/src/types";
