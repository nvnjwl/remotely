import { send } from './send.js';
import { MessageTypes } from '../shared/protocol.js';

export function snapshotStorage(){
  const data = {};
  for(let i=0;i<localStorage.length;i++){
    const k = localStorage.key(i);
    data[k] = localStorage.getItem(k);
  }
  send(MessageTypes.STORAGE, data);
}

export function watchStorage(){
  snapshotStorage();
  window.addEventListener('storage', snapshotStorage);
}
