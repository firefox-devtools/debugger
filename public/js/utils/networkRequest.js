// opts is ignored because this is only used in local development and
// replaces a more powerful network request from Firefox that can be
// configured.
function networkRequest(url, opts) {
  return Promise.race([
    fetch(`/get?url=${url}`)
      .then(res => {
        if (res.status >= 200 && res.status < 300) {
          return res.text().then(text => ({ content: text }));
        }
        return Promise.reject(new Error(`failed to request ${url}`));
      }),
    new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error("Connect timeout error")), 6000);
    })
  ]);
}

module.exports = networkRequest;
