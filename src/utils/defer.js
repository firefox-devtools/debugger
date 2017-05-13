/* @flow */

declare var Resolve: (result: any) => void;
declare var Reject: (result: any) => void;

export type Defer = {
  resolve: Resolve,
  reject: Reject,
  promise: Promise<any>
};

export default function defer(): Defer {
  let resolve: Resolve; // eslint-disable-line no-unused-vars
  let reject: Reject; // eslint-disable-line no-unused-vars
  const promise: Promise<any> = new Promise(function(
    innerResolve: Resolve,
    innerReject: Reject
  ) {
    resolve = innerResolve;
    reject = innerReject;
  });
  return {
    resolve,
    reject,
    promise
  };
}
