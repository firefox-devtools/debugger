/* @flow */

declare var Resolve: (result: any) => void;
declare var Reject: (result: any) => void;

export type Defer = {
  resolve: Resolve,
  reject: Reject,
  promise: Promise<any>
};

function defer(): Defer {
  let resolve: Resolve;
  let reject: Reject;
  const promise: Promise<any> = new Promise(function(
    innerResolve: Resolve,
    innerReject: Reject
  ) {
    resolve = innerResolve;
    reject = innerReject;
  });
  return {
    resolve: Resolve,
    reject: Reject,
    promise
  };
}

module.exports = defer;
