import { getState, subscribe, setState } from '../state/store.js';
import { initTransport, connectTo, sendHandshake } from '../runtime/transportInstance.js';

export function buildStatusBar() {
  const bar = document.createElement('div');
  bar.className = 'status-bar';

  const connectForm = document.createElement('form');
  connectForm.className = 'connect-form';
  connectForm.innerHTML = `
    <input name="target" placeholder="Target CPID" required />
    <button type="submit">Connect</button>
    <span class="status-dot disconnected" aria-label="status" role="status"></span>
    <span class="status-text">Disconnected</span>
  `;

  const statusDot = connectForm.querySelector('.status-dot');
  const statusText = connectForm.querySelector('.status-text');

  function updateStatus({ status, targetId }) {
    statusDot.className = 'status-dot ' + status;
    statusText.textContent =
      status === 'connected' ? `Connected to: ${targetId}` :
      status === 'connecting' ? `Connecting to: ${targetId || ''}` :
      status === 'ready' ? 'Ready for connection' :
      status === 'error' ? 'Connection error' : 'Disconnected';
  }

  subscribe('connection.status', () => updateStatus(getState().connection));
  subscribe('connection.targetId', () => updateStatus(getState().connection));

  connectForm.addEventListener('submit', e => {
    e.preventDefault();
    const targetId = new FormData(connectForm).get('target');
    setState('connection.targetId', targetId);
    setState('connection.status', 'connecting');
    if(!getState().connection.selfId){
      const selfId = 'ctrl-' + Math.random().toString(36).slice(2,8);
      setState('connection.selfId', selfId);
      initTransport(selfId, { debug:false });
      setTimeout(()=> {
        connectTo(targetId);
        setTimeout(()=> sendHandshake(), 500);
      }, 300);
    } else {
      connectTo(targetId);
      setTimeout(()=> sendHandshake(), 500);
    }
  });

  bar.appendChild(connectForm);
  return bar;
}
