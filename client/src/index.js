import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // ✅ import App that includes the Router

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
