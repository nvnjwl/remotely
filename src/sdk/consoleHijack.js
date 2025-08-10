import { MessageTypes, createMessage } from '../shared/protocol.js';
import { send } from './send.js';

export function hijackConsole(){
  ['log','error','warn','info'].forEach(level=>{
    const orig = console[level];
    console[level] = function(...args){
      try { send(MessageTypes.LOG, { level, message: args.map(a=>format(a)).join(' ') }); } catch(e){}
      return orig.apply(this, args);
    };
  });
}
function format(v){
  if(typeof v === 'string') return v;
  try { return JSON.stringify(v); } catch { return String(v); }
}
