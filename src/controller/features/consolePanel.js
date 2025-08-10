import { subscribe, getState } from '../state/store.js';

export function buildConsolePanel() {
  const root = document.createElement('div');
  root.className = 'console-panel';
  const list = document.createElement('ul');
  list.className = 'log-list';
  root.appendChild(list);

  function render() {
    list.innerHTML = '';
    getState().logs.slice(-200).forEach(l => {
      const li = document.createElement('li');
      li.textContent = `[${l.level}] ${l.message}`;
      li.className = 'log-item ' + l.level;
      list.appendChild(li);
    });
  }
  subscribe('logs', render);
  return root;
}
