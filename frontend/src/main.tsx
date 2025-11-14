import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './components/layout/App';
import './styles/index.css';

// Root entrypoint for the React application. Wraps the application in
// MaxUI provider and React Router. Dark/light theme handling is
// implemented inside App.

const container = document.getElementById('root');
if (!container) throw new Error('Root container missing');

const root = createRoot(container);
root.render(
  // Temporarily removed React.StrictMode for debugging purposes
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);