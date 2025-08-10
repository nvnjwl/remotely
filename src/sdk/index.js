import { initSdkTransport } from './transport.js';
import { hijackConsole } from './consoleHijack.js';
import { installFetchProxy } from './networkIntercept/fetchProxy.js';
import { installXHRProxy } from './networkIntercept/xhrProxy.js';
import { watchStorage } from './storageWatcher.js';
import { startRrweb } from './rrwebRecorder.js';
import { send } from './send.js';
import { MessageTypes } from '../shared/protocol.js';

let started = false;

export function startDebugSession(options = {}) {
  if(started) return; started = true;
  const selfId = options.selfId || localStorage.getItem('CPID') || 'sdk-' + Math.random().toString(36).slice(2,8);
  const controllerId = options.controllerId || localStorage.getItem('controllerId');
  initSdkTransport(selfId, controllerId, { secret: options.secret });
  hijackConsole();
  if(options.network !== false){
    installFetchProxy();
    installXHRProxy();
  }
  if(options.storage !== false){
    watchStorage();
  }
  if(options.rrweb){
    startRrweb();
  }
  window.addEventListener('error', e=>{
    send(MessageTypes.LOG, { level: 'error', message: e.message });
  });
}

export const DEBUG_MODE = { startDebugSession };
window.DEBUG_MODE = DEBUG_MODE;
