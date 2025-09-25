import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // You can create a basic index.css for global styles if needed
import App from './App';
import reportWebVitals from './reportWebVitals';

// Find the root DOM element from your index.html file
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the main App component into the root element
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
