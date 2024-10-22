import React from 'react';
import { createRoot } from 'react-dom/client'
import './index.css';
import App from './App';

const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
} else {
    console.error('Root container not found');
}

// Add this for better hot reloading support
if (module.hot) {
  module.hot.accept();
}