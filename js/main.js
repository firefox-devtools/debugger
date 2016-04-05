const React = require('react');
const ReactDOM = require('react-dom');
const { combineReducers, applyMiddleware, bindActionCreators } = require('redux');
const { Provider } = require('react-redux');
const configureStore = require('./create-store');
const reducers = require('./reducers');
const actions = require('./actions');
const App = require('./components/app');
const dom = React.DOM;

const { DebuggerClient } = require('devtools/shared/client/main');
const { DebuggerTransport } = require('devtools/transport/transport');
const { TargetFactory } = require("devtools/client/framework/target");
const socket = new WebSocket("ws://localhost:9000");
const transport = new DebuggerTransport(socket);
const client = new DebuggerClient(transport);

client.connect().then(() => {
  return client.listTabs().then(response => {
    const tab = response.tabs[response.selected];
    const options = { form: tab, client, chrome: false };
    TargetFactory.forRemoteTab(options).then(target => {
      target.activeTab.attachThread({}, (res, threadClient) => {
        threadClient.resume();
        window.gThreadClient = threadClient;
        connectThread(gThreadClient);
      });
    });
  });
}).catch(err => console.log(err));

const createStore = configureStore({ log: false});
const store = createStore(combineReducers(reducers));

function connectThread(threadClient) {
  threadClient.addListener("newSource", (event, packet) => {
    store.dispatch(actions.newSource(packet.source));
  });

  store.dispatch(actions.loadSources())
}

ReactDOM.render(
  React.createElement(
    Provider,
    { store },
    React.createElement(App)
  ),
  document.querySelector('#mount')
);
