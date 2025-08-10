import { ensureRrweb } from '../runtime/lazy.js';
import { subscribe, getState } from '../state/store.js';

export function buildReplayPanel() {
  const root = document.createElement('div');
  root.className = 'replay-panel';
  const controls = document.createElement('div');
  controls.innerHTML = '<button data-action="play">Play</button> <button data-action="clear">Clear</button>';
  const container = document.createElement('div');
  container.className = 'rrweb-player';
  root.appendChild(controls);
  root.appendChild(container);

  let player = null;
  async function play(){
    const rrweb = await ensureRrweb();
    const events = getState().rrwebEvents || [];
    if(player) player.destroy?.();
    player = new rrweb.Replayer(events, { root: container });
    player.play();
  }
  controls.querySelector('[data-action="play"]').addEventListener('click', play);
  controls.querySelector('[data-action="clear"]').addEventListener('click', ()=>{ player?.destroy?.(); container.innerHTML=''; });
  subscribe('rrwebEvents', () => {/* could update UI */});
  return root;
}
