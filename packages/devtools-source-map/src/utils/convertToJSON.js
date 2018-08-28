/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at <http://mozilla.org/MPL/2.0/>. */

/* eslint camelcase: 0*/

let cachedWasmModule;
let utf8Decoder;

function convertDwarf(wasm, instance) {
  const { memory, alloc_mem, free_mem, convert_dwarf } = instance.exports;
  const wasmPtr = alloc_mem(wasm.byteLength);
  new Uint8Array(memory.buffer, wasmPtr, wasm.byteLength).set(
    new Uint8Array(wasm)
  );
  const resultPtr = alloc_mem(12);
  const enableXScopes = false;
  convert_dwarf(
    wasmPtr,
    wasm.byteLength,
    resultPtr,
    resultPtr + 4,
    enableXScopes
  );
  free_mem(wasmPtr);
  const resultView = new DataView(memory.buffer, resultPtr, 12);
  const outputPtr = resultView.getUint32(0, true),
    outputLen = resultView.getUint32(4, true);
  free_mem(resultPtr);
  if (!utf8Decoder) {
    utf8Decoder = new TextDecoder("utf-8");
  }
  const output = utf8Decoder.decode(
    new Uint8Array(memory.buffer, outputPtr, outputLen)
  );
  free_mem(outputPtr);
  return output;
}

async function convertToJSON(buffer: ArrayBuffer): any {
  if (!cachedWasmModule) {
    const isFirefoxPanel =
      typeof location !== "undefined" && location.protocol === "resource:";
    const wasmPath = `${isFirefoxPanel ? "." : "/wasm"}/dwarf_to_json.wasm`;
    const wasm = await (await fetch(wasmPath)).arrayBuffer();
    const imports = {};
    const { instance } = await WebAssembly.instantiate(wasm, imports);
    cachedWasmModule = instance;
  }
  return convertDwarf(buffer, cachedWasmModule);
}

module.exports = {
  convertToJSON
};
