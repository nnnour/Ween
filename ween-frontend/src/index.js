import React from 'react';
import { createRoot } from 'react-dom/client'; // Updated import
import App from './App';
import './index.css';

const container = document.getElementById('root'); // Target the root element
const root = createRoot(container); // Create a React root

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
