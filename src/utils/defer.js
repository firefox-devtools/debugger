/* flow */

export type deferred = {
  resolve: (result: any) => void,
  reject: (result: any) => void,
  promise: Promise
};

function defer(): deferred {
  let resolve: (result: any) => void;
  let reject: (result: any) => void;
  let promise = new Promise(function(
    innerResolve: (result: any) => void,
    innerReject: (result: any) => void
  ) {
    resolve = innerResolve;
    reject = innerReject;
  });
  return {
    resolve: resolve,
    reject: reject,
    promise: promise
  };
}

module.exports = defer;
