'// @flow'
const initialState = {
    from: "",
    workers: []
};

export default function debuggee(state = initialState, action) {
    switch (action.type) {
    case "SET_WORKERS":
      return {
        ...action.workers
      };
    default:
        return state;
    }
}