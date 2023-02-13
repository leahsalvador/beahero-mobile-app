/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import allReducers from './reducers/index.js'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'
import Main from './components/main'
import Echo from "laravel-echo";
import config from './config'

const store = createStore(
  allReducers,
  applyMiddleware(thunk)
)

const App = () => {
  console.log("`${config.REACT_APP_BASE_URL}`", `${config.REACT_APP_BASE_URL}`)
  window.Pusher = require('pusher-js')
  window.Echo = new Echo({
    broadcaster: 'pusher',
    key: 'test002',
    wsHost: `${config.REACT_APP_BASE_URL}`,
    // wsHost: `${'172.20.10.4'}`,
    // wsHost: `${'52.14.220.83'}`,
    wsPort: 6001,
    forceTLS: false,
    dsiableStats: true
  })
  return (
    <Provider store={store}>
      <Main />
    </Provider>
  );
};



export default App