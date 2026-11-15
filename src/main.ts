/* ==========================================================================
   OJTFlow Application Bootstrap (src/main.ts)
   Loads base CSS token/layout/component layers and mounts client router
   ========================================================================== */

import './styles/tokens.css';
import './styles/reset.css';
import './styles/layout.css';
import './styles/components.css';

import { initRouter } from './router';

const appRoot = document.querySelector<HTMLDivElement>('#app');

if (!appRoot) {
  throw new Error('Root element #app was not found in index.html.');
}

initRouter(appRoot);