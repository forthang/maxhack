import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles/index.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root container missing');

const root = createRoot(container);

// Step 2: Reintroduce BrowserRouter to see if it triggers the error.
root.render(
  <BrowserRouter>
    <div style={{ padding: '2rem', textAlign: 'center', fontSize: '1.5rem' }}>
      Hello World! Router is active. Debugging in progress...
    </div>
  </BrowserRouter>
);