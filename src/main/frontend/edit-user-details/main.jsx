import React from 'react';
import {createRoot} from 'react-dom/client';

import App from './App';

let hasMounted = false;

const mountApp = () => {
  if (hasMounted) {
    return;
  }

  const rootElement = document.getElementById('editUserDetailsReactRoot');
  const config = window.userDashboardReactConfig;

  if (!rootElement || !config) {
    return;
  }

  hasMounted = true;
  createRoot(rootElement).render(<App config={config} />);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp, {once: true});
} else {
  mountApp();
}
