import { isWasm, lineToWasmOffset, wasmOffsetToLine } from "../wasm";
import { shouldPrettyPrint } from "../source";
import { isOriginalId } from "devtools-source-map";

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

export function shouldShowPrettyPrint(selectedSource) {
  if (!selectedSource) {
    return false;
  }

  return shouldPrettyPrint(selectedSource);
}

export function shouldShowFooter(selectedSource, horizontal) {
  if (!horizontal) {
    return true;
  }
  if (!selectedSource) {
    return false;
  }
  return (
    shouldShowPrettyPrint(selectedSource) ||
    isOriginalId(selectedSource.get("id"))
  );
}
