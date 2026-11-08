import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './bootstrap';

createRoot(document.getElementById('app')).render(
    React.createElement(React.StrictMode, null, React.createElement(App)),
);
