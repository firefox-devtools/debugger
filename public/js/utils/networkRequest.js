const { log } = require("./utils");

function networkRequest(url) {
  return Promise.race([
    fetch(`/get?url=${url}`)
      .then(res => {
        if (res.status >= 200 && res.status < 300) {
          return res.json();
        }
        log(`failed to request ${url}`);
        return Promise.resolve([]);
      }),
    new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error("Connect timeout error")), 6000);
    })
  ]);
}

module.exports = {
  networkRequest
};
