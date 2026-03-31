import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import App from './App.jsx';

// Strip the /app prefix so the React app sees "/" as its root.
// This runs once before React mounts — no router library needed.

const isDemo = window.location.pathname.includes('/app/demo');

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App isDemo={isDemo} />
  </StrictMode>
);
