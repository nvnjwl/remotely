import { sendCommand } from '../runtime/commands.js';

export function buildCommandPanel() {
  const root = document.createElement('div');
  root.className = 'command-panel';
  const form = document.createElement('form');
  form.innerHTML = `
    <textarea name="code" placeholder="Enter JS command" rows="5" style="width:100%;"></textarea>
    <div style="margin-top:.5rem; display:flex; gap:.5rem;">
      <button type="submit">Run</button>
      <button type="button" data-action="clear">Clear</button>
    </div>
    <pre class="cmd-result" aria-live="polite"></pre>
  `;
  const result = form.querySelector('.cmd-result');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const code = new FormData(form).get('code');
    sendCommand(code, (res) => {
      result.textContent = res.success ? res.value : 'Error: ' + res.error;
    });
  });
  form.querySelector('[data-action="clear"]').addEventListener('click', () => {
    form.querySelector('textarea').value = '';
    result.textContent = '';
  });
  root.appendChild(form);
  return root;
}
