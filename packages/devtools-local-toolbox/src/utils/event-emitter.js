let EventEmitter = function() {};

const defer = require("./defer");

/**
 * Decorate an object with event emitter functionality.
 *
 * @param Object objectToDecorate
 *        Bind all public methods of EventEmitter to
 *        the objectToDecorate object.
 */
EventEmitter.decorate = function(objectToDecorate) {
  let emitter = new EventEmitter();
  objectToDecorate.on = emitter.on.bind(emitter);
  objectToDecorate.off = emitter.off.bind(emitter);
  objectToDecorate.once = emitter.once.bind(emitter);
  objectToDecorate.emit = emitter.emit.bind(emitter);
};

EventEmitter.prototype = {
  /**
   * Connect a listener.
   *
   * @param string event
   *        The event name to which we're connecting.
   * @param function listener
   *        Called when the event is fired.
   */
  on(event, listener) {
    if (!this._eventEmitterListeners) {
      this._eventEmitterListeners = new Map();
    }
    if (!this._eventEmitterListeners.has(event)) {
      this._eventEmitterListeners.set(event, []);
    }
    this._eventEmitterListeners.get(event).push(listener);
  },

  /**
   * Listen for the next time an event is fired.
   *
   * @param string event
   *        The event name to which we're connecting.
   * @param function listener
   *        (Optional) Called when the event is fired. Will be called at most
   *        one time.
   * @return promise
   *        A promise which is resolved when the event next happens. The
   *        resolution value of the promise is the first event argument. If
   *        you need access to second or subsequent event arguments (it's rare
   *        that this is needed) then use listener
   */
  once(event, listener) {
    let deferred = defer();

    let handler = (_, first, ...rest) => {
      this.off(event, handler);
      if (listener) {
        listener.apply(null, [event, first, ...rest]);
      }
      deferred.resolve(first);
    };

    handler._originalListener = listener;
    this.on(event, handler);

    return deferred.promise;
  },

  /**
   * Remove a previously-registered event listener.  Works for events
   * registered with either on or once.
   *
   * @param string event
   *        The event name whose listener we're disconnecting.
   * @param function listener
   *        The listener to remove.
   */
  off(event, listener) {
    if (!this._eventEmitterListeners) {
      return;
    }
    let listeners = this._eventEmitterListeners.get(event);
    if (listeners) {
      this._eventEmitterListeners.set(event, listeners.filter(l => {
        return l !== listener && l._originalListener !== listener;
      }));
    }
  },

  /**
   * Emit an event.  All arguments to this method will
   * be sent to listener functions.
   */
  emit(event) {
    if (!this._eventEmitterListeners
        || !this._eventEmitterListeners.has(event)) {
      return;
    }

    let originalListeners = this._eventEmitterListeners.get(event);
    for (let listener of this._eventEmitterListeners.get(event)) {
      // If the object was destroyed during event emission, stop
      // emitting.
      if (!this._eventEmitterListeners) {
        break;
      }

      // If listeners were removed during emission, make sure the
      // event handler we're going to fire wasn't removed.
      if (originalListeners === this._eventEmitterListeners.get(event) ||
        this._eventEmitterListeners.get(event).some(l => l === listener)) {
        try {
          listener.apply(null, arguments);
        } catch (ex) {
          // Prevent a bad listener from interfering with the others.
          let msg = `${ex}: ${ex.stack}`;
          console.error(msg);
        }
      }
    }
  }
};

module.exports = EventEmitter;
