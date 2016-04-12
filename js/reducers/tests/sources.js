/* globals equal */
/* eslint camelcase: 0 */
/* eslint no-unused-vars: 0 */
"use strict";

const reducer = require("../sources.js");
const constants = require("../../constants.js");

function run_test() {
  const state = reducer(
    undefined,
    { type: constants.ADD_SOURCE,
      source: {
        actor: "1",
        url: "http://example.com"
      }}
  );

  equal(state.sources["1"].url, "http://example.com");
}
