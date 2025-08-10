import { send } from '../send.js';
import { MessageTypes } from '../../shared/protocol.js';

export function installFetchProxy(){
  const orig = window.fetch;
  window.fetch = async function(input, init){
    const start = performance.now();
    const method = (init && init.method) || 'GET';
    const url = typeof input==='string'? input : input.url;
    const id = Math.random().toString(36).slice(2);
    send(MessageTypes.NET_REQ, { id, method, url, ts: Date.now() });
    try {
      const res = await orig.apply(this, arguments);
      const clone = res.clone();
      let bodyText = '';
      try { bodyText = await clone.text(); } catch {}
      send(MessageTypes.NET_RES, { id, status: res.status, duration: +(performance.now()-start).toFixed(1), bodySnippet: bodyText.slice(0,500) });
      return res;
    } catch(err) {
      send(MessageTypes.NET_RES, { id, status: 'ERR', error: String(err), duration: +(performance.now()-start).toFixed(1) });
      throw err;
    }
  };
}
