import { send } from './send.js';
import { MessageTypes } from '../shared/protocol.js';

export function enableCommandExec(){
  window.addEventListener('message', e=>{});
}

export function handleIncoming(msg){
  if(msg.type === MessageTypes.CMD){
    const { code, id } = msg.payload;
    try {
      // eslint-disable-next-line no-eval
      const value = eval(code);
      send(MessageTypes.CMD_RESULT, { id, success:true, value: serialize(value) });
    } catch(err){
      send(MessageTypes.CMD_RESULT, { id, success:false, error: String(err) });
    }
  }
}
function serialize(v){
  if(v === undefined) return 'undefined';
  if(typeof v === 'function') return v.toString().slice(0,200);
  try { return JSON.stringify(v); } catch { return String(v); }
}
