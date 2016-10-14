function networkRequest(url, opts) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();

    req.addEventListener("readystatechange", () => {
      if (req.readyState === XMLHttpRequest.DONE) {
        if (req.status === 200) {
          resolve({ content: req.responseText });
        } else {
          resolve(req.statusText);
        }
      }
    });

    // Not working yet.
    // if (!opts.loadFromCache) {
    //   req.channel.loadFlags = (
    //     Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE |
    //       Components.interfaces.nsIRequest.INHIBIT_CACHING |
    //       Components.interfaces.nsIRequest.LOAD_ANONYMOUS
    //   );
    // }

    req.open("GET", url);
    req.send();
  });
}

module.exports = networkRequest;
