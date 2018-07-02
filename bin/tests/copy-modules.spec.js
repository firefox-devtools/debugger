const {transformSingleFile} = require("../copy-modules")
const path = require("path")

function transform(filename) {
  return transformSingleFile(path.join(__dirname,`./fixtures/${filename}.js`))
}

describe("Copy modules", () => {
  it("transforms", () => {
    const out = transform("transforms")
    expect(out).toMatchSnapshot()
  });

  it("imports", () => {
    const out = transform("imports")
    expect(out).toMatchSnapshot()
  });

  it("single telemetry", () => {
    const out = transform("single-telemetry-import")
    expect(out).toMatchSnapshot()
  });

  it("default telemtry", () => {
    const out = transform("default-telemetry-import")
    expect(out).toMatchSnapshot()
  });
});
