import { send } from '../send.js';
import { MessageTypes } from '../../shared/protocol.js';

export function installXHRProxy(){
  const Orig = window.XMLHttpRequest;
  function X(){
    const xhr = new Orig();
    const id = Math.random().toString(36).slice(2);
    let url='', method='';
    const start = performance.now();
    xhr._open = xhr.open;
    xhr.open = function(m,u){ method=m; url=u; xhr._open(m,u,true); };
    xhr.addEventListener('loadstart', ()=>{
      send(MessageTypes.NET_REQ, { id, method, url, ts: Date.now() });
    });
    xhr.addEventListener('loadend', ()=>{
      send(MessageTypes.NET_RES, { id, status: xhr.status, duration: +(performance.now()-start).toFixed(1), bodySnippet: (xhr.responseText||'').slice(0,500) });
    });
    xhr.addEventListener('error', ()=>{
      send(MessageTypes.NET_RES, { id, status: 'ERR', duration: +(performance.now()-start).toFixed(1) });
    });
    return xhr;
  }
  window.XMLHttpRequest = X;
}
