export type Message = {
  data: {
    id: string,
    method: string,
    args: Array<any>
  }
};

let msgId = 1;
/**
 * @memberof utils/utils
 * @static
 */
function workerTask(worker: any, method: string) {
  return function(...args: any) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      worker.postMessage({ id, method, args });

      const listener = ({ data: result }) => {
        if (result.id !== id) {
          return;
        }

        worker.removeEventListener("message", listener);
        if (result.error) {
          reject(result.error);
        } else {
          resolve(result.response);
        }
      };

      worker.addEventListener("message", listener);
    });
  };
}

function workerHandler(publicInterface) {
  return function onTask(msg: Message) {
    const { id, method, args } = msg.data;
    const response = publicInterface[method].apply(null, args);

    if (response instanceof Promise) {
      response
        .then(val => self.postMessage({ id, response: val }))
        .catch(error => self.postMessage({ id, error }));
    } else {
      self.postMessage({ id, response });
    }
  };
}

module.exports = {
  workerTask,
  workerHandler
};
