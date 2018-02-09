import { correctIndentation, getIndentation } from "../indentation";

describe("indentation", () => {
  it("simple", () => {
    expect(
      correctIndentation(`
      foo
    `)
    ).toMatchSnapshot();
  });

  it("one line", () => {
    expect(correctIndentation("foo")).toMatchSnapshot();
  });

  it("one function", () => {
    const text = `
      function foo() {
        console.log("yo")
      }
    `;

    expect(correctIndentation(text)).toMatchSnapshot();
  });

  it("try catch", () => {
    const text = `
      try {
        console.log("yo")
      } catch (e) {
        console.log("yo")
      }
    `;

    expect(correctIndentation(text)).toMatchSnapshot();
  });

  it("mad indentation", () => {
    const text = `
      try {
        console.log("yo")
      } catch (e) {
        console.log("yo")
          }
    `;

    expect(correctIndentation(text)).toMatchSnapshot();
  });
});

describe("indentation length", () => {
  it("leading spaces", () => {
    const line = "                console.log('Hello World');";

    expect(getIndentation(line)).toEqual(16);
  });
});
