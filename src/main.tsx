import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Mounts the V-Taper 5K React application into the DOM root
export function mountApplication(): void {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root DOM element #root not found');
  }

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

mountApplication();
