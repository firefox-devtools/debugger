import { isWasm, lineToWasmOffset, wasmOffsetToLine } from "../wasm";

export function toEditorLine(sourceId: string, lineOrOffset: number): number {
  if (isWasm(sourceId)) {
    // TODO ensure offset is always "mappable" to edit line.
    // todo, is wasm 0 based or 1 based?
    const line = wasmOffsetToLine(sourceId, lineOrOffset) || 0;
    return line + 1;
  }

  return lineOrOffset ? lineOrOffset : 1;
}

export function toSourceLine(sourceId: string, line: number): ?number {
  // todo, is wasm 0 based or 1 based?
  return isWasm(sourceId) ? lineToWasmOffset(sourceId, line) : line;
}
