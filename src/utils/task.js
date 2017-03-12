// @flow

/**
 * This object provides the public module functions.
 */
const Task = {
  // XXX: Not sure if this works in all cases...
  async: function(task) {
    return function() {
      return Task.spawn(task, this, arguments);
    };
  },

  /**
   * Creates and starts a new task.
   * @param task A generator function
   * @return A promise, resolved when the task terminates
   */
  spawn: function(task, scope, args) {
    return new Promise(function(resolve, reject) {
      const iterator = task.apply(scope, args);

      const callNext = lastValue => {
        const iteration = iterator.next(lastValue);
        Promise.resolve(iteration.value)
               .then(value => {
                 if (iteration.done) {
                   resolve(value);
                 } else {
                   callNext(value);
                 }
               })
               .catch(error => {
                 reject(error);
                 iterator.throw(error);
               });
      };

      callNext(undefined);
    });
  },
};

module.exports = { Task };
