/* @flow */

import { BinaryReader } from "wasmparser/dist/WasmParser";
import { WasmDisassembler } from "wasmparser/dist/WasmDis";

type WasmState = {
  lines: Array<number>,
  offsets: Array<number>
};

var wasmStates: { [string]: WasmState } = Object.create(null);

/**
 * @memberof utils/wasm
 * @static
 */
function getWasmText(sourceId: string, data: Uint8Array) {
  let parser = new BinaryReader();
  parser.setData(data.buffer, 0, data.length);
  let dis = new WasmDisassembler();
  dis.addOffsets = true;
  let done = dis.disassembleChunk(parser);
  let result = dis.getResult();
  if (result.lines.length === 0) {
    result = { lines: ["No luck with wast conversion"], offsets: [0], done };
  }

  let offsets = result.offsets,
    lines = [];
  for (let i = 0; i < offsets.length; i++) {
    lines[offsets[i]] = i;
  }

  wasmStates[sourceId] = { offsets, lines };

  return { lines: result.lines, done: result.done };
}

/**
 * @memberof utils/wasm
 * @static
 */
function getWasmLineNumberFormatter(sourceId: string) {
  const codeOf0 = 48,
    codeOfA = 65;
  let buffer = [
    codeOf0,
    codeOf0,
    codeOf0,
    codeOf0,
    codeOf0,
    codeOf0,
    codeOf0,
    codeOf0
  ];
  let last0 = 7;
  return function(number: number) {
    let offset = lineToWasmOffset(sourceId, number - 1);
    if (offset === undefined) {
      return "";
    }
    let i = 7;
    for (let n = offset | 0; n !== 0 && i >= 0; n >>= 4, i--) {
      let nibble = n & 15;
      buffer[i] = nibble < 10 ? codeOf0 + nibble : codeOfA - 10 + nibble;
    }
    for (let j = i; j > last0; j--) {
      buffer[j] = codeOf0;
    }
    last0 = i;
    return String.fromCharCode.apply(null, buffer);
  };
}

/**
 * @memberof utils/wasm
 * @static
 */
function isWasm(sourceId: string) {
  return sourceId in wasmStates;
}

/**
 * @memberof utils/wasm
 * @static
 */
function lineToWasmOffset(sourceId: string, number: number) {
  let wasmState = wasmStates[sourceId];
  if (!wasmState) {
    return undefined;
  }
  let offset = wasmState.offsets[number];
  while (offset === undefined && number > 0) {
    offset = wasmState.offsets[--number];
  }
  return offset;
}

/**
 * @memberof utils/wasm
 * @static
 */
function wasmOffsetToLine(sourceId: string, offset: number) {
  let wasmState = wasmStates[sourceId];
  if (!wasmState) {
    return undefined;
  }
  return wasmState.lines[offset];
}

/**
 * @memberof utils/wasm
 * @static
 */
function clearWasmStates() {
  wasmStates = Object.create(null);
}

function renderWasmText(sourceId: string, { binary }: Object) {
  // binary does not survive as Uint8Array, converting from string
  let data = new Uint8Array(binary.length);
  for (let i = 0; i < data.length; i++) {
    data[i] = binary.charCodeAt(i);
  }
  let { lines } = getWasmText(sourceId, data);
  const MAX_LINES = 100000;
  if (lines.length > MAX_LINES) {
    lines.splice(MAX_LINES, lines.length - MAX_LINES);
    lines.push(";; .... text is truncated due to the size");
  }
  return lines;
}

export {
  getWasmText,
  getWasmLineNumberFormatter,
  isWasm,
  lineToWasmOffset,
  wasmOffsetToLine,
  clearWasmStates,
  renderWasmText
};
