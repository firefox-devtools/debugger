const CDP = require("chrome-remote-interface");

const results = [];

function runTests() {
  return new Promise(resolve => {
    CDP(client => {
      // Extract used DevTools domains.
      const { Page, Runtime } = client;

      // Enable events on domains we are interested in.
      Promise.all([Page.enable()]).then(() => {
        return Page.navigate({ url: "http://localhost:8000/integration" });
      });

      Runtime.enable();
      Runtime.consoleAPICalled(({ type, args }) => {
        const argVals = args.map(arg => arg.value).join(", ");
        console.log(argVals);

        if (argVals.match(/WERE DON/)) {
          results.push(argVals);
          client.close();
          resolve();
        }
      });
    });
  });
}

runTests().then(() => {
  console.log(results.join("\n"));
});
