import { readFile } from "./helpers/readFile";
import { readOutput } from "../../../bin/mochi";

function simulateMochitest(file) {
  const out = readOutput(readFile(file));
  // console.log(out.join("\n"));
  return out;
}

describe("mochi", () => {
  it("basic", () => {
    const out = simulateMochitest("basic.txt");
    expect(out).toMatchSnapshot();
  });

  it("full run", () => {
    const out = simulateMochitest("full.txt");
    expect(out).toMatchSnapshot();
  });

  it("error", () => {
    const out = simulateMochitest("error.txt");
    expect(out).toMatchSnapshot();
  });

  it("console_error", () => {
    const out = simulateMochitest("console_error.txt");
    expect(out).toMatchSnapshot();
  });
});
