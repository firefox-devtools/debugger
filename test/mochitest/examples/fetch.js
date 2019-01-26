const doc = "doc-xhr.html";


function main(url, method) {
  const initObj = {
    method: (method ? method : "GET")
  };
  fetch(url, initObj).then(console.log);
}
