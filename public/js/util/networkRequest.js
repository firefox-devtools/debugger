"use strict";

function networkRequest(url) {
  return fetch(`/get?url=${url}`)
    .then(res => res.json())
    .catch(res => {});
}

module.exports = {
  networkRequest
};
