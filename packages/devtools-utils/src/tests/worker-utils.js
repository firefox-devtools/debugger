/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const {
  WorkerDispatcher,
  workerHandler,
  streamingWorkerHandler
} = require("../worker-utils");

describe("worker utils", () => {
  it("starts a worker", () => {
    const dispatcher = new WorkerDispatcher();
    global.Worker = jest.fn();
    dispatcher.start("foo");
    expect(dispatcher.worker).toEqual(global.Worker.mock.instances[0]);
  });

  it("stops a worker", () => {
    const dispatcher = new WorkerDispatcher();
    const terminateMock = jest.fn();

    global.Worker = jest.fn(() => ({
      terminate: terminateMock
    }));

    dispatcher.start();
    dispatcher.stop();

    expect(dispatcher.worker).toEqual(null);
    expect(terminateMock.mock.calls.length).toEqual(1);
  });

  it("dispatches a task", () => {
    const dispatcher = new WorkerDispatcher();
    const postMessageMock = jest.fn();
    const addEventListenerMock = jest.fn();

    global.Worker = jest.fn(() => {
      return {
        postMessage: postMessageMock,
        addEventListener: addEventListenerMock
      };
    });

    dispatcher.start();
    const task = dispatcher.task("foo");
    task("bar");

    const postMessageMockCall = postMessageMock.mock.calls[0][0];

    expect(postMessageMockCall).toEqual({
      calls: [["bar"]],
      id: 1,
      method: "foo"
    });

    expect(addEventListenerMock.mock.calls.length).toEqual(1);
  });

  it("dispatches a queued task", async () => {
    const dispatcher = new WorkerDispatcher();
    let postMessageMock;
    const postMessagePromise = new Promise(resolve => {
      postMessageMock = jest.fn(resolve);
    });

    const addEventListenerMock = jest.fn();

    global.Worker = jest.fn(() => {
      return {
        postMessage: postMessageMock,
        addEventListener: addEventListenerMock
      };
    });

    dispatcher.start();
    const task = dispatcher.task("foo", { queue: true });
    task("bar");
    task("baz");

    expect(postMessageMock).not.toHaveBeenCalled();

    await postMessagePromise;

    const postMessageMockCall = postMessageMock.mock.calls[0][0];

    expect(postMessageMockCall).toEqual({
      calls: [["bar"], ["baz"]],
      id: 1,
      method: "foo"
    });

    expect(addEventListenerMock.mock.calls.length).toEqual(1);
  });

  it("test workerHandler error case", async () => {
    let postMessageMock;
    const postMessagePromise = new Promise(resolve => {
      postMessageMock = jest.fn(resolve);
    });

    self.postMessage = postMessageMock;

    let callee = {
      doSomething: () => {
        throw new Error("failed");
      }
    };

    let handler = workerHandler(callee);

    handler({ data: { id: 53, method: "doSomething", calls: [[]] } });

    await postMessagePromise;

    expect(postMessageMock.mock.calls[0][0]).toEqual({
      id: 53,
      results: [
        {
          error: "Error: failed",
        }
      ]
    });
  });

  it("test a task completing when the worker has shutdown", () => {
    const dispatcher = new WorkerDispatcher();
    const postMessageMock = jest.fn();
    const addEventListenerMock = jest.fn();
    const terminateMock = jest.fn();

    global.Worker = jest.fn(() => {
      return {
        postMessage: postMessageMock,
        addEventListener: addEventListenerMock,
        terminate: terminateMock
      };
    });

    dispatcher.start();
    const task = dispatcher.task("foo");
    const resp = task("bar");
    resp.catch(e => expect(e).toEqual("Oops, The worker has shutdown!"));

    const listener = addEventListenerMock.mock.calls[0][1];
    dispatcher.stop();
    listener({ data: { id: 1 } });
  });
});

it("streams a task", async () => {
  jest.useRealTimers();

  const postMessageMock = jest.fn();

  const worker = {
    postMessage: postMessageMock
  };

  function makeTasks() {
    return [
      {
        callback: () => new Promise(resolve => setTimeout(() => resolve(1), 50))
      },
      {
        callback: () => new Promise(resolve => setTimeout(() => resolve(2), 50))
      }
    ];
  }

  const workerHandler = streamingWorkerHandler(
    { makeTasks },
    { timeout: 25 },
    worker
  );

  const id = 1;
  const task = workerHandler({ data: { id, method: "makeTasks", calls: [[]] } });
  await task;

  expect(postMessageMock.mock.calls.length).toBe(4);
  expect(postMessageMock.mock.calls[0][0]).toEqual({
    id,
    status: "start"
  });
  expect(postMessageMock.mock.calls[1][0]).toEqual({
    id,
    status: "pending",
    data: [1]
  });
  expect(postMessageMock.mock.calls[2][0]).toEqual({
    id,
    status: "pending",
    data: [2]
  });
  expect(postMessageMock.mock.calls[3][0]).toEqual({
    id,
    status: "done"
  });
});
