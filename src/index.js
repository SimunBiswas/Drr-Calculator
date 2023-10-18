import React from 'react';
import { createRoot } from 'react-dom/client';  
import { Provider } from 'react-redux';
import store from './redux/store';
import MyForm from './App';

const root = createRoot(document.getElementById('root'));

root.render(
  <Provider store={store}>
    <MyForm />
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
