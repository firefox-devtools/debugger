"use strict";

const { log } = require("./utils");

function networkRequest(url) {
  return fetch(`/get?url=${url}`)
    .then(res => res.json())
    .catch(res => {
      log(`failed to request ${url}`);
    });
}

module.exports = {
  networkRequest
};
