import { subscribe, getState } from '../state/store.js';

export function buildStoragePanel() {
  const root = document.createElement('div');
  root.className = 'storage-panel';
  const table = document.createElement('table');
  table.innerHTML = '<thead><tr><th>Key</th><th>Value</th></tr></thead><tbody></tbody>';
  const tbody = table.querySelector('tbody');
  root.appendChild(table);

  function render() {
    tbody.innerHTML='';
    const entries = Object.entries(getState().storage||{});
    entries.forEach(([k,v])=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${escapeHtml(k)}</td><td>${escapeHtml(String(v))}</td>`;
      tbody.appendChild(tr);
    });
  }
  subscribe('storage', render);
  return root;
}
function escapeHtml(s){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}
