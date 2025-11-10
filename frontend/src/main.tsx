import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MaxUI } from '@maxhub/max-ui';
import '@maxhub/max-ui/dist/styles.css';
import App from './App';

// Root entrypoint for the React application. Wraps the application in
// MaxUI provider and React Router. Dark/light theme handling is
// implemented inside App.

const container = document.getElementById('root');
if (!container) throw new Error('Root container missing');

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <MaxUI>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MaxUI>
  </React.StrictMode>,
);