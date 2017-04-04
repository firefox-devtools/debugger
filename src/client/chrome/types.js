// @flow

export type ServerLocation = {
  scriptId: string,
  lineNumber: number,
  columnNumber?: number
};

export type Agents = {
  Debugger: any,
  Runtime: any,
  Page: any
};

export type ChromeClientConnection = {
  connectNodeClient: () => void,
  connectNode: () => void
};
