import React from 'react';
import { createRoot } from 'react-dom/client';
// import { BrowserRouter } from 'react-router-dom';
// import App from './components/layout/App';
import './styles/index.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root container missing');

const root = createRoot(container);

// Render a simple element instead of the complex App component tree
root.render(
  <div style={{ padding: '2rem', textAlign: 'center', fontSize: '1.5rem' }}>
    Hello World! Debugging in progress...
  </div>
);