function setupReducer(initialState, map) {
  return function(state = initialState, action) {
    const handler = map[action.type];
    if (!handler) {
      return state;
    }

    return handler(action, state);
  };
}

module.exports = setupReducer;
