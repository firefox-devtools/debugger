// @flow

export type SearchModifiers = {
  caseSensitive: boolean,
  wholeWord: boolean,
  regexMatch: boolean
};

export type Expression = {
   value: Object,
   input: string
 };

export type {
  Breakpoint,
  Frame,
  Grip,
  LoadedObject,
  Location,
  Source,
  SourceText,
  Pause,
  Why
} from "devtools-client-adapters/src/types";
