const initialState = {
    workers: ["dummyworker 1", "dummyworker 2"]
};

export default function debuggee(state = initialState, action) {
    return state;
}