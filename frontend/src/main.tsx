import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './components/layout/App';
import './styles/index.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root container missing');

const root = createRoot(container);

// Step 3: Render a minimal App component to test.
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);