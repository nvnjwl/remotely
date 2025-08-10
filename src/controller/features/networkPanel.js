import { subscribe, getState } from '../state/store.js';

export function buildNetworkPanel() {
  const root = document.createElement('div');
  root.className = 'network-panel';
  const table = document.createElement('table');
  table.className = 'net-table';
  table.innerHTML = '<thead><tr><th>Method</th><th>URL</th><th>Status</th><th>Time</th></tr></thead><tbody></tbody>';
  const tbody = table.querySelector('tbody');
  root.appendChild(table);
  function render() {
    tbody.innerHTML = '';
    getState().network.slice(-300).forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.method}</td><td title="${r.url}">${truncate(r.url, 80)}</td><td>${r.status||''}</td><td>${r.duration||''}</td>`;
      tbody.appendChild(tr);
    });
  }
  subscribe('network', render);
  return root;
}
function truncate(str, n){return str.length>n?str.slice(0,n-3)+'...':str;}
