import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

// Simplified startup, as Supabase client doesn't need async initialization.
// Data fetching and error handling are managed within the App component.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);