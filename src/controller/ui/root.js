// Builds the entire controller DOM dynamically
import { buildStatusBar } from './statusBar.js';
import { buildTabs } from './tabs.js';

export function mountController(root = document.body) {
  const app = document.createElement('div');
  app.id = 'remote-debugger';
  app.appendChild(buildStatusBar());
  app.appendChild(buildTabs());
  root.appendChild(app);
}
