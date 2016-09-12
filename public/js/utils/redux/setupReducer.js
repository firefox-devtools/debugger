function setupReducer(initialState, map) {
  return function(state = initialState, action) {
    const handler = map[action.type];
    if (!handler) {
      return state;
    }

    const ret = handler(state, action);
    return ret || state;
  };
}

module.exports = setupReducer;
