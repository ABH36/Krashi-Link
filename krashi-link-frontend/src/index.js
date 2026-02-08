import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import './i18n';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 🛑 FIX: Change register() to unregister() to stop MIME type error
// Jab hum future me PWA setup karenge tab ise wapis register() kar denge
serviceWorkerRegistration.unregister();