/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// @flow

export type Message = {
  data: {
    id: string,
    method: string,
    args: Array<any>
  }
};

function WorkerDispatcher() {
  this.msgId = 1;
  this.worker = null;
}

WorkerDispatcher.prototype = {
  start(url) {
    this.worker = new Worker(url);
    this.worker.onerror = () => {
      console.error(`Error in worker ${url}`);
    };
  },

  stop() {
    if (!this.worker) {
      return;
    }

    this.worker.terminate();
    this.worker = null;
  },

  task(method, { queue = false } = {}) {
    const calls = [];
    const push = (args: Array<any>) => {
      return new Promise((resolve, reject) => {
        if (queue && calls.length === 0) {
          Promise.resolve().then(flush);
        }

        calls.push([args, resolve, reject]);

        if (!queue) {
          flush();
        }
      });
    }

    const flush = () => {
      const items = calls.slice();
      calls.length = 0;

      const id = this.msgId++;
      this.worker.postMessage({ id, method, calls: items.map(item => item[0]) });

      const listener = ({ data: result }) => {
        if (result.id !== id) {
          return;
        }

        if (!this.worker) {
          return;
        }

        this.worker.removeEventListener("message", listener);

        result.results.forEach((resultData, i) => {
          const [, resolve, reject] = items[i];

          if (resultData.error) {
            reject(resultData.error);
          } else {
            resolve(resultData.response);
          }
        });
      };

      this.worker.addEventListener("message", listener);
    }

    return (...args: any) => push(args);
  }
};

function workerHandler(publicInterface: Object) {
  return function (msg: Message) {
    const { id, method, calls } = (msg.data: any);

    Promise.all(calls.map(args => {
      try {
        const response = publicInterface[method].apply(undefined, args);
        if (response instanceof Promise) {
          return response.then(
            val => ({ response: val }),
            // Error can't be sent via postMessage, so be sure to
            // convert to string.
            err => ({ error: err.toString() })
          );
        } else {
          return { response };
        }
      } catch (error) {
        // Error can't be sent via postMessage, so be sure to convert to
        // string.
        return { error: error.toString() };
      }
    })).then(results => {
      self.postMessage({ id, results });
    });
  };
}

function streamingWorkerHandler(
  publicInterface: Object,
  { timeout = 100 }: Object = {},
  worker: Object = self
) {
  async function streamingWorker(id, tasks) {
    let isWorking = true;

    const intervalId = setTimeout(() => {
      isWorking = false;
    }, timeout);

    const results = [];
    while (tasks.length !== 0 && isWorking) {
      const { callback, context, args } = tasks.shift();
      const result = await callback.call(context, args);
      results.push(result);
    }
    worker.postMessage({ id, status: "pending", data: results });
    clearInterval(intervalId);

    if (tasks.length !== 0) {
      await streamingWorker(id, tasks);
    }
  }

  return async function (msg: Message) {
    const { id, method, args } = msg.data;
    const workerMethod = publicInterface[method];
    if (!workerMethod) {
      console.error(`Could not find ${method} defined in worker.`);
    }
    worker.postMessage({ id, status: "start" });

    try {
      const tasks = workerMethod(args);
      await streamingWorker(id, tasks);
      worker.postMessage({ id, status: "done" });
    } catch (error) {
      worker.postMessage({ id, status: "error", error });
    }
  };
}

module.exports = {
  WorkerDispatcher,
  workerHandler,
  streamingWorkerHandler
};
