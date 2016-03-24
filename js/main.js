const React = require('react');
const ReactDOM = require('react-dom');
const { combineReducers, applyMiddleware } = require('redux');
const { Provider } = require('react-redux');
const configureStore = require('./create-store');
const reducers = require('./reducers');
const App = require('./components/app');
const dom = React.DOM;

const createStore = configureStore({ log: false});
const store = createStore(combineReducers(reducers), window.APP_STATE);

ReactDOM.render(
  React.createElement(
    Provider,
    { store },
    React.createElement(App)
  ),
  document.querySelector('#mount')
);
