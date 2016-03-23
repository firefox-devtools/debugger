const React = require('react');
const ReactDOM = require('react-dom');
const { combineReducers, applyMiddleware } = require('redux');
const { Provider } = require('react-redux');
const createStore = require('./create-store');
const reducers = require('./reducers');
const App = require('./components/app');
const dom = React.DOM;

const store = createStore({ log: false})(combineReducers(reducers));

ReactDOM.render(
  React.createElement(
    Provider,
    { store },
    React.createElement(App)
  ),
  document.querySelector('#mount')
);
