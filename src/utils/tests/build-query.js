const expect = require("expect.js");
const escapeRegExp = require("lodash/escapeRegExp");

const buildQuery = require("../build-query");

describe("build-query", () => {
  it("case-sensitive, whole-word, regex search", () => {
    const query = buildQuery("hi.*", {
      caseSensitive: true,
      wholeWord: true,
      regexMatch: true
    }, {});

    expect(query.source).to.be("\\bhi.*\\b");
    expect(query.flags).to.be("");
    expect(query.ignoreCase).to.be(false);
  });

  it("case-insensitive, non-whole, string search", () => {
    const query = buildQuery("hi", {
      caseSensitive: false,
      wholeWord: false,
      regexMatch: false
    }, {});

    expect(query.source).to.be("hi");
    expect(query.flags).to.be("i");
    expect(query.ignoreCase).to.be(true);
  });

  it("case-sensitive string search", () => {
    const query = buildQuery("hi", {
      caseSensitive: true,
      wholeWord: false,
      regexMatch: false
    }, {});

    expect(query.source).to.be("hi");
    expect(query.flags).to.be("");
    expect(query.ignoreCase).to.be(false);
  });

  it("string search with wholeWord", () => {
    const query = buildQuery("hi", {
      caseSensitive: false,
      wholeWord: true,
      regexMatch: false
    }, {});

    expect(query.source).to.be("\\bhi\\b");
    expect(query.ignoreCase).to.be(true);
  });

  it("case-insensitive, regex search", () => {
    const query = buildQuery("hi.*", {
      caseSensitive: false,
      wholeWord: false,
      regexMatch: true
    }, {});

    expect(query.source).to.be("hi.*");
    expect(query.flags).to.be("i");
    expect(query.ignoreCase).to.be(true);
  });

  it("string search with wholeWord and case sensitivity", () => {
    const query = buildQuery("hi", {
      caseSensitive: true,
      wholeWord: true,
      regexMatch: false
    }, {});

    expect(query.source).to.be("\\bhi\\b");
    expect(query.ignoreCase).to.be(false);
  });

  it("string search with regex chars escaped", () => {
    const query = buildQuery("hi.*", {
      caseSensitive: true,
      wholeWord: true,
      regexMatch: false
    }, {});

    expect(query.source).to.be("\\bhi\\.\\*\\b");
    expect(query.ignoreCase).to.be(false);
  });

  it("global search", () => {
    const query = buildQuery("hi", {
      caseSensitive: true,
      wholeWord: false,
      regexMatch: false
    }, {
      isGlobal: true
    });

    expect(query.source).to.be("hi");
    expect(query.ignoreCase).to.be(false);
    expect(query.global).to.be(true);
  });

  it("ignore spaces w/o spaces", () => {
    const query = buildQuery("hi", {
      caseSensitive: true,
      wholeWord: false,
      regexMatch: false
    }, {
      ignoreSpaces: true
    });

    expect(query.source).to.be("hi");
    expect(query.ignoreCase).to.be(false);
    expect(query.global).to.be(false);
  });

  it("ignore spaces w/ spaces", () => {
    const query = buildQuery("  ", {
      caseSensitive: true,
      wholeWord: false,
      regexMatch: false
    }, {
      ignoreSpaces: true
    });

    expect(query.source).to.be(escapeRegExp("(?!\s*.*)"));
    expect(query.ignoreCase).to.be(false);
    expect(query.global).to.be(false);
  });

  it("global, case-insensitive search", () => {
    const query = buildQuery("hi.*", {
      caseSensitive: false,
      wholeWord: false,
      regexMatch: true
    }, {
      isGlobal: true
    });

    console.log(query.source, query.ignoreCase, query.global, query.flags);
    expect(query.source).to.be("hi.*");
    expect(query.ignoreCase).to.be(true);
    expect(query.global).to.be(true);
    expect(query.flags).to.be("gi");
  });
});
