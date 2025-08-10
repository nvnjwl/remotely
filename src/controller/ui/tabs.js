import { buildConsolePanel } from '../features/consolePanel.js';
import { buildNetworkPanel } from '../features/networkPanel.js';
import { buildStoragePanel } from '../features/storagePanel.js';
import { buildCommandPanel } from '../features/commandPanel.js';
import { buildReplayPanel } from '../features/replayPanel.js';

export function buildTabs() {
  const wrapper = document.createElement('div');
  wrapper.className = 'tabs-wrapper';

  const tabs = [
    { id: 'console', label: 'Console', panel: buildConsolePanel },
    { id: 'network', label: 'Network', panel: buildNetworkPanel },
    { id: 'storage', label: 'Storage', panel: buildStoragePanel },
    { id: 'commands', label: 'Commands', panel: buildCommandPanel },
    { id: 'replay', label: 'Replay', panel: buildReplayPanel },
  ];

  const tabBar = document.createElement('div');
  tabBar.className = 'tab-bar';
  const panels = document.createElement('div');
  panels.className = 'tab-panels';

  tabs.forEach((t, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = t.label;
    btn.dataset.tab = t.id;
    btn.addEventListener('click', () => selectTab(t.id));
    tabBar.appendChild(btn);

    const panel = document.createElement('div');
    panel.className = 'tab-panel';
    panel.dataset.panel = t.id;
    if (i === 0) panel.classList.add('active');
    panel.appendChild(t.panel());
    panels.appendChild(panel);
  });

  function selectTab(id) {
    panels.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.dataset.panel === id));
    tabBar.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset.tab === id));
  }

  wrapper.appendChild(tabBar);
  wrapper.appendChild(panels);
  return wrapper;
}
